import { html, render, type TemplateResult } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import Prism from "prismjs";
import "prismjs/components/prism-zig.js";
import type { Snapshot } from "@mantaq/core";
import {
  attachPersistence,
  backToHome,
  createAppActor,
  deckProgress,
  flip,
  grade,
  openDeck,
  reset,
  resetProgress,
  restartDeck,
  type AppActor,
  type AppContext,
  type AppEvent,
  type DeckIndex,
} from "./machine/index.ts";
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

const TYPE_LABEL: Record<CardType, string> = {
  output: "output",
  fix: "fix this",
  concept: "concept",
};
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
    return p
      .split("\n")
      .map((seg, j, arr): unknown => (j < arr.length - 1 ? html`${seg}<br />` : html`${seg}`));
  })}`;
}

/* ---------- machine wiring ---------- */

type ScreenName = "home" | "review" | "done";

let actor: AppActor | null = null;
let deckIndex: DeckIndex = {};

function send(event: AppEvent): void {
  actor?.send(event);
}

function boot(): void {
  deckIndex = Object.fromEntries(window.ZigCards.decks.map((d) => [d.id, d]));
  actor = createAppActor({ decks: deckIndex });
  attachPersistence(actor, localStorage);
  actor.on("change", onMachineChange);
}

function onMachineChange(snap: Snapshot<AppContext>, prev: Snapshot<AppContext>): void {
  renderApp(snap, prev);
}

function setTopbar(title: string | null, sub: string | null, idx: number, len: number): void {
  const inSession = actor?.snapshot().context.session != null;
  $("btn-back").hidden = !inSession;
  $("tb-title").textContent = inSession ? title || "ZigCards" : "ZigCards";
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
  if (window.scrollTo) window.scrollTo(0, 0);
}

/* ---------- home ---------- */

function homeTemplate(ctx: AppContext): TemplateResult {
  const decks = window.ZigCards.decks.slice().sort((a, b) => a.order - b.order);
  return html`
    <div class="hero">
      <h1>ZigCards</h1>
      <p>Spaced-repetition flashcards for learning Zig &mdash; sourced from <b>ziglings</b>.</p>
    </div>
    ${decks.map(
      (deck): unknown => html`
        <div class="deck-row" @click=${() => send(openDeck.create({ deckId: deck.id }))}>
          <span class="num">${String(deck.order).padStart(2, "0")}</span>
          <span class="meta">
            <span class="name">${deck.title}</span>
            <br /><span class="sub">${deck.blurb}</span>
          </span>
          ${deckProgressBadge(deck, ctx.progress)}
        </div>
      `,
    )}
    <div class="footer-note">
      ${ctx.stats.reviews > 0 ? html`${ctx.stats.reviews} review${ctx.stats.reviews === 1 ? "" : "s"} done &middot; ` : ""}
      <button
        @click=${() => {
          if (confirm("Reset all progress?")) {
            send(resetProgress.create());
          }
        }}
      >
        reset progress
      </button>
      <br />ZigCards v${APP_VERSION}
    </div>
  `;
}

function deckProgressBadge(deck: Deck, progress: AppContext["progress"]): TemplateResult {
  const p = deckProgress(deck, progress);
  if (p.seen === 0) return html`<span class="badge">new</span>`;
  const pct = Math.round((p.seen / p.total) * 100);
  return html`<span class="badge ${p.seen === p.total ? "done" : ""}">${pct}%</span>`;
}

function renderHome(ctx: AppContext): void {
  setTopbar("ZigCards", "choose a deck", 0, 0);
  show("home");
  render(homeTemplate(ctx), screens.home);
}

/* Test hook: send the machine back to a clean home (used by the vitest browser setup). */
export function resetToHome(): void {
  send(reset.create());
}

/* ---------- review session ---------- */

interface ReviewView {
  card: Card;
  revealed: boolean;
  grading: boolean;
  lastGrade: { known: boolean } | null;
}

function reviewTemplate(v: ReviewView): TemplateResult {
  const { card, revealed, grading, lastGrade } = v;
  const known = lastGrade?.known ?? false;
  const flyOut = grading
    ? `transform: translateX(${(known ? window.innerWidth : -window.innerWidth) * 1.2}px) rotate(${known ? 8 : -8}deg); opacity: 0; transition: transform 240ms ease, opacity 240ms ease;`
    : "";
  const flashClass = grading ? `grade-flash ${known ? "ok" : "no"} show` : "grade-flash";
  const flashText = grading ? (known ? "\u2713" : "\u2717") : "";
  return html`
    <div
      id="card"
      class="card ${revealed ? "revealed" : ""}"
      tabindex="0"
      role="button"
      aria-label="Flashcard. Tap to flip, then use the buttons to grade."
      style="${flyOut}"
      @click=${onCardTap}
    >
      <div class="card-inner">
        <span class="card-type ${card.type}">${TYPE_LABEL[card.type]}</span>
        <div class="card-front">${inlineText(card.front)}</div>
        ${card.code ? codeBlock(card.code) : ""}
        <div id="card-back" class="card-back" ?hidden=${!revealed}>
          <div class="answer">${inlineText(card.back)}</div>
          ${card.backCode ? codeBlock(card.backCode) : ""}
          ${
            card.explanation ? html`<div class="explain">${inlineText(card.explanation)}</div>` : ""
          }
        </div>
      </div>
      <div id="card-tap" class="card-tap" ?hidden=${revealed}>tap the card to flip</div>
      <div id="flash" class="${flashClass}">${flashText}</div>
    </div>
    <div class="actions">
      ${
        grading
          ? ""
          : revealed
            ? html` <button
                  id="btn-unknown"
                  class="btn btn-unknown"
                  @click=${() => send(grade.create({ known: false }))}
                >
                  <span class="btn-icon">&#10005;</span><span class="btn-label">Didn't know</span>
                </button>
                <button
                  id="btn-known"
                  class="btn btn-known"
                  @click=${() => send(grade.create({ known: true }))}
                >
                  <span class="btn-icon">&#10003;</span><span class="btn-label">Knew</span>
                </button>`
            : html` <button id="btn-show" class="btn btn-show" @click=${() => send(flip.create())}>
                Show answer
              </button>`
      }
    </div>
  `;
}

function renderReview(snap: Snapshot<AppContext>, prev: Snapshot<AppContext>): void {
  const session = snap.context.session;
  const deck = session ? deckIndex[session.deckId] : null;
  const card = session && deck ? (deck.cards[session.idx] ?? null) : null;
  if (!session || !deck || !card) return;
  const state = snap.path[0];
  const grading = state === "review.grading";
  const revealed = state === "review.back" || grading;
  if (session.idx !== prev.context.session?.idx) {
    screens.review.scrollTop = 0;
  }
  setTopbar(null, deck.title, session.idx, deck.cards.length);
  show("review");
  render(
    reviewTemplate({
      card,
      revealed,
      grading,
      lastGrade: snap.context.lastGrade,
    }),
    screens.review,
  );
}

/* ---------- card interaction ---------- */

function onCardTap(): void {
  send(flip.create());
}

/* ---------- done ---------- */

function renderDone(snap: Snapshot<AppContext>): void {
  const session = snap.context.session;
  const deck = session ? deckIndex[session.deckId] : null;
  const title = deck?.title ?? "ZigCards";
  setTopbar(null, title, 0, 0);
  show("done");
  const known = session?.known ?? 0;
  const unknown = session?.unknown ?? 0;
  const total = known + unknown;
  const acc = total ? Math.round((known / total) * 100) : 0;
  render(
    html`
      <div class="done-box">
        <h2>Session complete</h2>
        <div class="sub">${title} &middot; ${total} cards</div>
        <div class="done-stats">
          <div class="done-stat">
            <div class="v good">${known}</div>
            <div class="l">knew</div>
          </div>
          <div class="done-stat">
            <div class="v bad">${unknown}</div>
            <div class="l">didn't know</div>
          </div>
          <div class="done-stat">
            <div class="v">${acc}%</div>
            <div class="l">accuracy</div>
          </div>
        </div>
        <button
          class="primary-btn"
          @click=${() => {
            send(restartDeck.create());
          }}
        >
          Review again
        </button>
        <button class="ghost-btn" @click=${() => send(backToHome.create())}>Back to decks</button>
      </div>
    `,
    screens.done,
  );
}

function renderApp(snap: Snapshot<AppContext>, prev: Snapshot<AppContext>): void {
  const [name] = snap.path;
  if (name === "home") renderHome(snap.context);
  else if (name === "done") renderDone(snap);
  else renderReview(snap, prev);
}

/* ---------- topbar + keyboard ---------- */

$("btn-back").addEventListener("click", () => send(backToHome.create()));

document.addEventListener("keydown", (e: KeyboardEvent) => {
  const state = actor?.snapshot().path[0] ?? "";
  if (!state.startsWith("review.")) return;
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    send(flip.create());
  } else if (e.key === "ArrowRight") {
    send(grade.create({ known: true }));
  } else if (e.key === "ArrowLeft") {
    send(grade.create({ known: false }));
  }
});

/* ---------- boot ---------- */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  // Already-loaded page (e.g. tests): defer a tick so the entry module body
  // (which sets window.ZigCards) runs before the first render.
  setTimeout(boot, 0);
}
