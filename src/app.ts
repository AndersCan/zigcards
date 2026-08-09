import { html, render, type TemplateResult } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import Prism from "prismjs";
import "prismjs/components/prism-zig.js";
import { store } from "./store.ts";
import type { Card, CardType, Deck } from "./types.ts";

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el;
}

const screens: Record<ScreenName, HTMLElement> = {
  home: $("screen-home"),
  review: $("screen-review"),
  done: $("screen-done"),
};

const TYPE_LABEL: Record<CardType, string> = { output: "output", fix: "fix this", concept: "concept" };
const APP_VERSION = "0.2.0";

/* ---------- code rendering (Prism) ---------- */

function zigGrammar(): Prism.Grammar {
  return Prism.languages.zig ?? Prism.languages.clike;
}

function codeBlock(code: string): TemplateResult {
  const h = Prism.highlight(code, zigGrammar(), "zig");
  return html`<pre class="code"><code class="language-zig">${unsafeHTML(h)}</code></pre>`;
}

function inlineText(text: string): TemplateResult {
  const parts = text.split(/`([^`]+)`/g);
  return html`${parts.map((p, i): unknown => {
    if (i % 2) return html`<code class="inline">${p}</code>`;
    return p.split("\n").map((seg, j, arr): unknown =>
      j < arr.length - 1 ? html`${seg}<br/>` : html`${seg}`
    );
  })}`;
}

/* ---------- state ---------- */

type ScreenName = "home" | "review" | "done";

interface Session {
  deck: Deck;
  cards: Card[];
  idx: number;
  known: number;
  unknown: number;
}

interface Drag {
  x: number;
  y: number;
  dx: number;
}

let session: Session | null = null;
let revealed = false;
let drag: Drag | null = null;

function setTopbar(title: string | null, sub: string | null, idx: number, len: number): void {
  const inSession = session != null;
  $("btn-back").hidden = !inSession;
  $("tb-title").textContent = inSession ? (title || "ZigCards") : "ZigCards";
  $("tb-sub").textContent = sub || "";
  if (inSession) {
    $("tb-count").hidden = false;
    $("tb-count").textContent = `${idx + 1}/${len}`;
    $("tb-progress-wrap").hidden = false;
    $("tb-progress").style.width = `${(idx / len) * 100}%`;
  } else {
    $("tb-count").hidden = true;
    $("tb-progress-wrap").hidden = true;
  }
}

function show(name: ScreenName): void {
  for (const [k, el] of Object.entries(screens)) {
    el.hidden = k !== name;
    el.scrollTop = 0;
  }
  document.documentElement.scrollTop = 0;
  window.scrollTo && window.scrollTo(0, 0);
}

/* ---------- home ---------- */

function homeTemplate(): TemplateResult {
  const decks = window.ZigCards.decks.slice().sort((a, b) => a.order - b.order);
  const s = store.stats;
  return html`
    <div class="hero">
      <h1>ZigCards</h1>
      <p>Spaced-repetition flashcards for learning Zig &mdash; sourced from <b>ziglings</b>.</p>
    </div>
    ${decks.map(
      (deck): unknown => html`
        <div class="deck-row" @click=${() => startSession(deck)}>
          <span class="num">${String(deck.order).padStart(2, "0")}</span>
          <span class="meta">
            <span class="name">${deck.title}</span>
            <br /><span class="sub">${deck.blurb}</span>
          </span>
          ${deckProgressBadge(deck)}
        </div>
      `
    )}
    <div class="footer-note">
      ${s.reviews > 0 ? html`${s.reviews} review${s.reviews === 1 ? "" : "s"} done &middot; ` : ""}
      <button @click=${() => { if (confirm("Reset all progress?")) { store.reset(); renderHome(); } }}>reset progress</button>
      <br />ZigCards v${APP_VERSION}
    </div>
  `;
}

function deckProgressBadge(deck: Deck): TemplateResult {
  const p = store.deckProgress(deck);
  if (p.seen === 0) return html`<span class="badge">new</span>`;
  const pct = Math.round((p.seen / p.total) * 100);
  return html`<span class="badge ${p.seen === p.total ? "done" : ""}">${pct}%</span>`;
}

function renderHome(): void {
  setTopbar("ZigCards", "choose a deck", 0, 0);
  show("home");
  render(homeTemplate(), screens.home);
}

/* ---------- review session ---------- */

function startSession(deck: Deck): void {
  session = { deck, cards: deck.cards.slice(), idx: 0, known: 0, unknown: 0 };
  revealed = false;
  drag = null;
  show("review");
  renderCard();
}

function renderCard(): void {
  if (!session) return;
  const card = session.cards[session.idx];
  setTopbar(null, session.deck.title, session.idx, session.cards.length);

  render(
    html`
      <div
        id="card"
        class="card ${revealed ? "revealed" : ""}"
        tabindex="0"
        role="button"
        aria-label="Flashcard. Tap to flip, then swipe or use the buttons to grade."
        @pointerdown=${onPointerDown}
        @pointermove=${onPointerMove}
        @pointerup=${onPointerUp}
        @click=${onCardTap}
      >
        <div class="card-inner">
          <span class="card-type ${card.type}">${TYPE_LABEL[card.type]}</span>
          <div class="card-front">${inlineText(card.front)}</div>
          ${card.code ? codeBlock(card.code) : ""}
          <div id="card-back" class="card-back" ?hidden=${!revealed}>
            <div class="answer">${inlineText(card.back)}</div>
            ${card.backCode ? codeBlock(card.backCode) : ""}
            ${card.explanation
              ? html`<div class="explain">${inlineText(card.explanation)}</div>`
              : ""}
          </div>
        </div>
        <div id="card-tap" class="card-tap" ?hidden=${revealed}>tap the card to flip</div>
        <div id="flash" class="grade-flash"></div>
      </div>
      <div class="actions">
        ${revealed
          ? html`
              <button id="btn-unknown" class="btn btn-unknown" @click=${() => grade(false)}>
                <span class="btn-icon">&#10005;</span><span class="btn-label">Didn't know</span>
              </button>
              <button id="btn-known" class="btn btn-known" @click=${() => grade(true)}>
                <span class="btn-icon">&#10003;</span><span class="btn-label">Knew</span>
              </button>`
          : html`
              <button id="btn-show" class="btn btn-show" @click=${flip}>Show answer</button>`}
      </div>
    `,
    screens.review
  );
  const el = $("card");
  el.style.transform = "";
  el.style.opacity = "";
  el.style.transition = "";
}

function flip(): void {
  if (revealed || !session) return;
  revealed = true;
  renderCard();
}

/* ---------- swipe / tap ---------- */

function onPointerDown(e: PointerEvent): void {
  const card = e.currentTarget as HTMLElement;
  drag = { x: e.clientX, y: e.clientY, dx: 0 };
  card.setPointerCapture && card.setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent): void {
  if (!drag) return;
  drag.dx = e.clientX - drag.x;
  const card = e.currentTarget as HTMLElement;
  if (revealed) {
    card.style.transform = `translateX(${drag.dx}px) rotate(${drag.dx * 0.04}deg)`;
    card.style.opacity = String(Math.min(1, 1 - Math.abs(drag.dx) / 500));
  } else if (Math.abs(drag.dx) < 6) {
    drag.dx = 0;
  }
}

function onPointerUp(e: PointerEvent): void {
  if (!drag) return;
  const { dx } = drag;
  const card = e.currentTarget as HTMLElement;
  drag = null;
  card.style.transform = "";
  card.style.opacity = "";
  if (!revealed) return;
  if (dx < -70) grade(false);
  else if (dx > 70) grade(true);
}

function onCardTap(e: Event): void {
  const card = e.currentTarget as HTMLElement;
  if (card && card.style.transform) return; // was a swipe
  flip();
}

/* ---------- grading ---------- */

function flash(ok: boolean): void {
  const el = $("flash");
  el.textContent = ok ? "\u2713" : "\u2717";
  el.className = "grade-flash " + (ok ? "ok" : "no") + " show";
  setTimeout(() => (el.className = "grade-flash"), 450);
}

function grade(known: boolean): void {
  if (!session || !revealed) return;
  const s = session;
  const card = s.cards[s.idx];
  if (known) s.known += 1;
  else s.unknown += 1;
  store.record(card.id, known);
  flash(known);

  const cardEl = $("card");
  const target = known ? window.innerWidth : -window.innerWidth;
  cardEl.style.transform = `translateX(${target * 1.2}px) rotate(${known ? 8 : -8}deg)`;
  cardEl.style.opacity = "0";
  cardEl.style.transition = "transform 240ms ease, opacity 240ms ease";

  setTimeout(() => {
    cardEl.style.transition = "";
    screens.review.scrollTop = 0;
    revealed = false;
    s.idx += 1;
    if (s.idx >= s.cards.length) renderDone();
    else renderCard();
  }, 240);
}

/* ---------- done ---------- */

function renderDone(): void {
  if (!session) return;
  const s = session;
  setTopbar(null, s.deck.title, 0, 0);
  show("done");
  const total = s.known + s.unknown;
  const acc = total ? Math.round((s.known / total) * 100) : 0;
  const deck = s.deck;
  render(
    html`
      <div class="done-box">
        <h2>Session complete</h2>
        <div class="sub">${deck.title} &middot; ${total} cards</div>
        <div class="done-stats">
          <div class="done-stat"><div class="v good">${s.known}</div><div class="l">knew</div></div>
          <div class="done-stat"><div class="v bad">${s.unknown}</div><div class="l">didn't know</div></div>
          <div class="done-stat"><div class="v">${acc}%</div><div class="l">accuracy</div></div>
        </div>
        <button class="primary-btn" @click=${() => { startSession(deck); }}>Review again</button>
        <button class="ghost-btn" @click=${renderHome}>Back to decks</button>
      </div>
    `,
    screens.done
  );
}

/* ---------- topbar + keyboard ---------- */

$("btn-back").addEventListener("click", renderHome);

document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (session && !screens.review.hidden) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!revealed) flip();
    } else if (e.key === "ArrowRight") {
      if (revealed) grade(true);
    } else if (e.key === "ArrowLeft") {
      if (revealed) grade(false);
    }
  }
});

/* ---------- boot ---------- */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderHome);
} else {
  renderHome();
}
