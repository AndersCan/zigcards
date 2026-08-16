import { html, render, type TemplateResult } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import Prism from "prismjs";
import "prismjs/components/prism-zig.js";
import "prismjs/components/prism-python.js";
import { RealClock, type Snapshot } from "@mantaq/core";
import {
  attachPersistence,
  backToHome,
  cardProgress,
  closeSettings,
  createAppActor,
  currentStreak,
  dayKey,
  deckProgress,
  drillMissed,
  flip,
  grade,
  initialContext,
  loadPersisted,
  longestStreak,
  openCredits,
  openDeck,
  openDeckDetail,
  openSection,
  openSettings,
  openStats,
  reset,
  resetProgress,
  restartDeck,
  skip,
  updateSettings,
  type AppActor,
  type AppContext,
  type AppEvent,
  type CodeSettings,
  type DeckIndex,
} from "./machine/index.ts";
import { SECTIONS } from "./sections.ts";
import { withViewTransition } from "./transitions.ts";
import type { Card, CardType, Deck, Section } from "./types.ts";

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el;
}

const screens: Record<ScreenName, HTMLElement> = {
  home: $("screen-home"),
  section: $("screen-section"),
  review: $("screen-review"),
  done: $("screen-done"),
  settings: $("screen-settings"),
  credits: $("screen-credits"),
  "deck.detail": $("screen-deck-detail"),
  stats: $("screen-stats"),
  error: $("screen-error"),
};

const TYPE_LABEL: Record<CardType, string> = {
  output: "output",
  fix: "fix this",
  concept: "concept",
};
const APP_VERSION = "0.3.0";

const DEFAULT_PRINT_WIDTH = 80;

/* ---------- code rendering (Prism) ---------- */

function grammarFor(language: string): Prism.Grammar {
  return Prism.languages[language] ?? Prism.languages.zig ?? Prism.languages.clike;
}

function codeBlock(code: string, language = "zig"): TemplateResult {
  const h = Prism.highlight(code, grammarFor(language), language);
  return html`<pre class="code"><code class="language-${language}">${unsafeHTML(h)}</code></pre>`;
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

function defaultCodeSize(): number {
  return window.matchMedia("(max-width: 480px)").matches ? 12 : 13.5;
}

function applyCodeSettings(settings: CodeSettings): void {
  const root = document.documentElement.style;
  if (settings.codeSize != null) root.setProperty("--code-size", `${settings.codeSize}px`);
  else root.removeProperty("--code-size");
  if (settings.printWidth != null)
    root.setProperty("--code-print-width", `${settings.printWidth}ch`);
  else root.removeProperty("--code-print-width");
}

/* ---------- machine wiring ---------- */

type ScreenName =
  | "home"
  | "section"
  | "review"
  | "done"
  | "settings"
  | "credits"
  | "deck.detail"
  | "stats"
  | "error";

let actor: AppActor | null = null;
let deckIndex: DeckIndex = {};

/* mantaq's RealClock.now() is a monotonic ms-since-boot counter; the machine
   stores absolute epoch timestamps (day keys, due dates), so hand it a clock
   whose `now()` is wall-clock time. */
class EpochClock extends RealClock {
  now(): number {
    return Date.now();
  }
}

function send(event: AppEvent): void {
  actor?.send(event);
}

function boot(): void {
  deckIndex = Object.fromEntries(window.ZigCards.decks.map((d) => [d.id, d]));
  const base = initialContext();
  const persisted = loadPersisted(localStorage);
  actor = createAppActor({
    decks: deckIndex,
    clock: new EpochClock(),
    context: persisted
      ? {
          ...base,
          progress: persisted.cards,
          stats: persisted.stats,
          history: persisted.history,
          session: persisted.session,
          settings: persisted.settings,
        }
      : base,
  });
  attachPersistence(actor, localStorage);
  actor.on("change", onMachineChange);
}

/** Group the review sub-states into one "screen" so only real navigation
 *  (home ↔ section ↔ review ↔ done ↔ …) gets a view transition. The
 *  within-review steps — flip reveal, grade fly-out, next card — keep their
 *  own CSS animations and re-render immediately. */
function screenName(path: string[]): string {
  const name = path[0] ?? "";
  return name.startsWith("review.") ? "review" : name;
}

/** Latest snapshot seen. The view-transition update callback runs a task
 *  after the machine change that queued it, and a newer change may have
 *  rendered directly in between; a stale callback must not clobber that newer
 *  render, so it only re-renders while its snapshot is still current. */
let latestSnap: Snapshot<AppContext> | null = null;

function onMachineChange(snap: Snapshot<AppContext>, prev: Snapshot<AppContext>): void {
  latestSnap = snap;
  if (screenName(snap.path) !== screenName(prev.path)) {
    withViewTransition(() => {
      if (latestSnap === snap) renderApp(snap, prev);
    });
  } else {
    renderApp(snap, prev);
  }
}

function setTopbar(title: string | null, sub: string | null, idx: number, len: number): void {
  $("tb-title").textContent = title || "Flash Cards";
  $("tb-sub").textContent = sub || "";
  if (actor?.snapshot().context.session != null) {
    $("tb-count").hidden = false;
    $("tb-count").textContent = `${idx + 1}/${len}`;
    $("tb-count").setAttribute("aria-label", `card ${idx + 1} of ${len}`);
    $("tb-progress-wrap").hidden = false;
    $("tb-progress").setAttribute("aria-valuenow", `${Math.round((idx / len) * 100)}`);
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
  const inSession = actor?.snapshot().context.session != null;
  $("btn-back").hidden = name === "home" || name === "error" || (name === "review" && !inSession);
  $("btn-settings").hidden =
    name === "settings" || name === "credits" || name === "error" || name === "done";
}

/* ---------- home (section picker) ---------- */

function groupDecksBySection(): Map<string, Deck[]> {
  const bySection = new Map<string, Deck[]>();
  for (const deck of window.ZigCards.decks) {
    const list = bySection.get(deck.section) ?? [];
    list.push(deck);
    bySection.set(deck.section, list);
  }
  return bySection;
}

function orderedSections(): Section[] {
  const bySection = groupDecksBySection();
  return SECTIONS.filter((s) => bySection.has(s.id)).sort((a, b) => a.order - b.order);
}

function sectionMeta(decks: Deck[], ctx: AppContext): TemplateResult {
  const now = Date.now();
  const totalCards = decks.reduce((n, d) => n + d.cards.length, 0);
  const due = decks.reduce((n, d) => n + deckProgress(d, ctx.progress, now).due, 0);
  return html`
    <span class="section-count">${totalCards} cards</span>
    ${due > 0 ? html`<span class="badge hot">${due} due</span>` : ""}
  `;
}

function homeTemplate(ctx: AppContext): TemplateResult {
  const bySection = groupDecksBySection();
  return html`
    <div class="hero">
      <h1>Flash Cards</h1>
      <p>
        Flashcards for learning Zig, Mojo, and Urdu &mdash; with the memory basics JavaScript never
        made you learn. Pick a topic to see its decks.
      </p>
    </div>
    ${orderedSections().map(
      (sec): unknown => html`
        <div
          class="section-card"
          role="button"
          tabindex="0"
          @click=${() => send(openSection.create({ sectionId: sec.id }))}
          @keydown=${activateOnKey(() => send(openSection.create({ sectionId: sec.id })))}
        >
          <span class="section-num">${String(sec.order)}</span>
          <span class="section-meta">
            <span class="section-title">${sec.title}</span>
            <span class="section-blurb">${sec.blurb}</span>
          </span>
          ${sectionMeta(bySection.get(sec.id)!, ctx)}
          <span class="chevron" aria-hidden="true">&#8250;</span>
        </div>
      `,
    )}
    <div class="footer-note">
      ${ctx.stats.reviews > 0 ? html`${ctx.stats.reviews} review${ctx.stats.reviews === 1 ? "" : "s"} done &middot; ` : ""}
      <button @click=${() => send(openCredits.create())}>Thanks &amp; acknowledgements</button>
      <button aria-label="Stats" @click=${() => send(openStats.create())}>stats</button>
      <br />
      <button
        @click=${() => {
          if (confirm("Reset all progress?")) {
            send(resetProgress.create());
          }
        }}
      >
        reset progress
      </button>
      <br />Flash Cards v${APP_VERSION}
    </div>
  `;
}

function deckProgressBadge(
  deck: Deck,
  progress: AppContext["progress"],
  now: number,
): TemplateResult {
  const p = deckProgress(deck, progress, now);
  if (p.seen === 0) return html`<span class="badge">new</span>`;
  if (p.due > 0) return html`<span class="badge hot">${p.due} due</span>`;
  return html`<span class="badge done">&#10003;</span>`;
}

function deckRow(deck: Deck, ctx: AppContext): TemplateResult {
  return html`
    <div
      class="deck-row"
      role="button"
      tabindex="0"
      @click=${() => send(openDeck.create({ deckId: deck.id }))}
      @keydown=${activateOnKey(() => send(openDeck.create({ deckId: deck.id })))}
    >
      <span class="num">${String(deck.order).padStart(2, "0")}</span>
      <span class="meta">
        <span class="name">${deck.title}</span>
        <span class="sub">${deck.blurb}</span>
      </span>
      <span class="row-end">
        ${ctx.session?.deckId === deck.id ? html`<span class="badge resume">resume</span>` : ""}
        ${deckProgressBadge(deck, ctx.progress, Date.now())}
        <button
          class="row-info"
          aria-label="Deck details"
          @click=${(e: Event): void => {
            e.stopPropagation();
            send(openDeckDetail.create({ deckId: deck.id }));
          }}
        >
          &#8505;
        </button>
      </span>
    </div>
  `;
}

/* ---------- section (deck list) ---------- */

function sectionTemplate(ctx: AppContext): TemplateResult {
  const sec = SECTIONS.find((s) => s.id === ctx.sectionId);
  if (!sec) return html``;
  const decks = window.ZigCards.decks
    .filter((d) => d.section === sec.id)
    .sort((a, b) => a.order - b.order);
  return html`
    <div class="section-head">
      <span class="section-num">${String(sec.order)}</span>
      <span class="section-meta">
        <span class="section-title">${sec.title}</span>
        <span class="section-blurb">${sec.blurb}</span>
      </span>
    </div>
    ${
      decks.length === 0
        ? html`<p class="list-empty">No decks in this section yet &mdash; check back soon.</p>`
        : decks.map((deck) => deckRow(deck, ctx))
    }
  `;
}

function renderHome(ctx: AppContext): void {
  setTopbar("Flash Cards", "choose a topic", 0, 0);
  $("tb-count").hidden = true;
  $("tb-progress-wrap").hidden = true;
  show("home");
  render(homeTemplate(ctx), screens.home);
}

function renderSection(ctx: AppContext): void {
  const sec = SECTIONS.find((s) => s.id === ctx.sectionId);
  $("tb-count").hidden = true;
  $("tb-progress-wrap").hidden = true;
  setTopbar(sec?.title ?? "Decks", sec ? "choose a deck" : "", 0, 0);
  show("section");
  render(sectionTemplate(ctx), screens.section);
}

/* Test hook: send the machine back to a clean home (used by the vitest browser setup). */
export function resetToHome(): void {
  send(reset.create());
}

/* ---------- credits ---------- */

const ZIGLINGS_URL = "https://codeberg.org/ziglings/exercises";
const ZIG_URL = "https://ziglang.org";
const MOJO_QUEST_URL = "https://github.com/modular/mojo-quest";
const MOJO_URL = "https://mojolang.org";

function creditsTemplate(): TemplateResult {
  return html`
    <h2 class="credits-title">Thanks &amp; acknowledgements</h2>
    <p class="credits-sub">The people and projects this app builds on.</p>

    <div class="credits-block">
      <h3>ziglings</h3>
      <p>
        The <b>Zig</b> section of this app is built from
        <a href="${ZIGLINGS_URL}" target="_blank" rel="noopener noreferrer">ziglings</a> &mdash; the
        classic exercise set for learning Zig, created by
        <a href="https://github.com/ratfactor" target="_blank" rel="noopener noreferrer"
          >Dave Gauer (ratfactor)</a
        >
        and Chris Boesch. We use it for inspiration: the exercises' teaching sequence and code are
        the source material for those decks.
      </p>
      <p>
        ziglings is licensed under the
        <a href="${ZIGLINGS_URL}/src/branch/main/LICENSE" target="_blank" rel="noopener noreferrer"
          >MIT License</a
        >
        &copy; 2021 Dave Gauer, Chris Boesch.
      </p>
    </div>

    <div class="credits-block">
      <h3>Zig</h3>
      <p>
        Zig is the language this app teaches. Learn more at
        <a href="${ZIG_URL}" target="_blank" rel="noopener noreferrer">ziglang.org</a>.
      </p>
    </div>

    <div class="credits-block">
      <h3>The Prerequisites section</h3>
      <p>
        The memory-basics decks are original content written for this app, aimed at developers who
        have spent years in JavaScript and never had to think about addresses, the stack, or the
        heap. They are not part of ziglings.
      </p>
    </div>

    <div class="credits-block">
      <h3>mojo-quest</h3>
      <p>
        The <b>Mojo</b> section of this app is built from
        <a href="${MOJO_QUEST_URL}" target="_blank" rel="noopener noreferrer">mojo-quest</a> &mdash;
        a browser game by
        <a href="${MOJO_URL}" target="_blank" rel="noopener noreferrer">Modular</a> that teaches
        Mojo by fixing issues in a fictional robotics company. We use it for inspiration: the
        tickets' teaching sequence and code are the source material for that deck.
      </p>
      <p>
        mojo-quest is licensed under the
        <a href="https://llvm.org/LICENSE.txt" target="_blank" rel="noopener noreferrer"
          >Apache License v2.0 with LLVM Exceptions</a
        >
        &copy; 2026 Modular Inc.
      </p>
    </div>

    <div class="credits-block">
      <h3>Mojo</h3>
      <p>
        Mojo is a Python-superset systems language for AI/ML by Modular. Learn more at
        <a href="${MOJO_URL}" target="_blank" rel="noopener noreferrer">mojolang.org</a>.
      </p>
    </div>

    <div class="credits-block">
      <h3>Tech</h3>
      <p>
        Built with <a href="https://lit.dev" target="_blank" rel="noopener noreferrer">lit-html</a>,
        <a href="https://github.com/AndersCan/mantaq" target="_blank" rel="noopener noreferrer"
          >Mantaq</a
        >, <a href="https://prismjs.com" target="_blank" rel="noopener noreferrer">Prism</a>, and
        <a href="https://viteplus.dev" target="_blank" rel="noopener noreferrer">Vite+</a>.
      </p>
      <p>
        Screen transitions use the
        <a
          href="https://developer.chrome.com/docs/web-platform/view-transitions"
          target="_blank"
          rel="noopener noreferrer"
          >View Transitions API</a
        >
        in the same pattern as
        <a href="https://github.com/AndersCan/justus" target="_blank" rel="noopener noreferrer"
          >Justus</a
        >
        &mdash; a photo-sharing app by the same author &mdash; which wraps its re-renders in
        <code class="inline">document.startViewTransition()</code>.
      </p>
    </div>
  `;
}

function renderCredits(): void {
  setTopbar("Flash Cards", "thanks & acknowledgements", 0, 0);
  $("tb-count").hidden = true;
  $("tb-progress-wrap").hidden = true;
  show("credits");
  render(creditsTemplate(), screens.credits);
}

/* ---------- review session ---------- */

interface ReviewView {
  card: Card;
  revealed: boolean;
  grading: boolean;
  lastGrade: { known: boolean } | null;
  language: string;
}

function reviewTemplate(v: ReviewView): TemplateResult {
  const { card, revealed, grading, lastGrade, language } = v;
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
      aria-label=${
        revealed
          ? "Flashcard showing the answer. Grade it with the buttons below."
          : "Flashcard. Tap to flip."
      }
      style="${flyOut}"
      @click=${onCardTap}
    >
      <div class="card-inner">
        <span class="card-type ${card.type}">${TYPE_LABEL[card.type]}</span>
        <div class="card-front">${inlineText(card.front)}</div>
        ${card.code ? codeBlock(card.code, language) : ""}
        <div id="card-back" class="card-back" ?hidden=${!revealed}>
          <div class="answer" dir="auto">${inlineText(card.back)}</div>
          ${card.backCode ? codeBlock(card.backCode, language) : ""}
          ${
            card.explanation ? html`<div class="explain">${inlineText(card.explanation)}</div>` : ""
          }
        </div>
      </div>
      <div id="card-tap" class="card-tap" ?hidden=${revealed}>tap the card to flip</div>
      <div id="flash" class="${flashClass}" aria-hidden="true">${flashText}</div>
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
    ${
      grading
        ? ""
        : html`<button id="btn-skip" class="btn-skip" @click=${() => send(skip.create())}>
            Skip this card
          </button>`
    }
  `;
}

function renderReview(snap: Snapshot<AppContext>, prev: Snapshot<AppContext>): void {
  const session = snap.context.session;
  const deck = session ? deckIndex[session.deckId] : null;
  const card = session && deck ? (deck.cards[session.order[session.idx]] ?? null) : null;
  if (!session || !deck || !card) return;
  const state = snap.path[0];
  const grading = state === "review.grading";
  const revealed = state === "review.back" || grading;
  if (session.idx !== prev.context.session?.idx) {
    screens.review.scrollTop = 0;
  }
  setTopbar(null, deck.title, session.idx, session.order.length);
  show("review");
  $("btn-settings").hidden = grading;
  render(
    reviewTemplate({
      card,
      revealed,
      grading,
      lastGrade: snap.context.lastGrade,
      language: deck.language ?? "zig",
    }),
    screens.review,
  );
}

/* ---------- card interaction ---------- */

function onCardTap(): void {
  send(flip.create());
}

/* Keyboard activation for tappable-but-not-native rows (Enter/Space). Ignore
   keydowns from nested native controls (e.g. the ⓘ detail button) and from
   rows on a screen that has already been left (still focused while hidden). */
function activateOnKey(action: () => void): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest("button, input, select, textarea, a")) return;
    if ((e.currentTarget as HTMLElement | null)?.closest("[hidden]")) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };
}

/* ---------- done ---------- */

function renderDone(snap: Snapshot<AppContext>): void {
  const session = snap.context.session;
  const deck = session ? deckIndex[session.deckId] : null;
  const title = deck?.title ?? "Flash Cards";
  setTopbar(null, title, 0, 0);
  $("tb-count").hidden = true;
  $("tb-progress-wrap").hidden = true;
  show("done");
  const known = session?.known ?? 0;
  const unknown = session?.unknown ?? 0;
  const total = known + unknown;
  const acc = total ? Math.round((known / total) * 100) : 0;
  const missed = session?.missed.length ?? 0;
  const skipped = session?.skipped ?? 0;
  const empty = (session?.order.length ?? 0) === 0;
  const statsGrid = html`
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
      <div class="done-stat">
        <div class="v">${skipped}</div>
        <div class="l">skipped</div>
      </div>
    </div>
  `;
  const buttons = empty
    ? html`<button
        class="primary-btn"
        @click=${() => {
          send(restartDeck.create());
        }}
      >
        Practice all cards
      </button>`
    : html`<button
          class="primary-btn"
          ?disabled=${missed === 0}
          @click=${() => {
            send(drillMissed.create());
          }}
        >
          Review missed (${missed})
        </button>
        <button
          class="secondary-btn"
          @click=${() => {
            send(restartDeck.create());
          }}
        >
          Practice all cards
        </button>`;
  render(
    html`
      <div class="done-box">
        <h2>${empty ? "All caught up!" : "Session complete"}</h2>
        <div class="sub">${title} &middot; ${empty ? "nothing due" : `${total} cards`}</div>
        ${
          empty
            ? html`<p class="done-empty">
                No cards are due right now &mdash; come back tomorrow, or practice the whole deck.
              </p>`
            : statsGrid
        }
        ${buttons}
        <button class="ghost-btn" @click=${() => send(backToHome.create())}>Back to decks</button>
      </div>
    `,
    screens.done,
  );
}

/* ---------- deck detail ---------- */

function shortDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function relativeDate(ts: number, now: number): string {
  const diff = now - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  const days = Math.floor(diff / 86_400_000);
  if (days < 7) return `${days}d ago`;
  return shortDate(ts);
}

function detailCardRow(card: Card, progress: AppContext["progress"], now: number): TemplateResult {
  const p = cardProgress(progress, card.id);
  const weak = p.state === "relearning" || (p.seen > 0 && p.known <= p.unknown);
  const last = p.last === 0 ? "never" : relativeDate(p.last, now);
  const due = p.seen > 0 ? (p.due <= now ? "due now" : `due ${shortDate(p.due)}`) : "not seen";
  return html`
    <div class="detail-card ${weak ? "weak" : ""}">
      <span class="card-type ${card.type}">${TYPE_LABEL[card.type]}</span>
      <div class="detail-card-front">${inlineText(card.front)}</div>
      <div class="detail-card-stats">
        <span class="chip">seen ${p.seen}</span>
        <span class="chip">${p.known}/${p.unknown}</span>
        <span class="chip">${last}</span>
        <span class="chip ${p.seen > 0 && p.due <= now ? "due" : ""}">${due}</span>
        <span class="chip state ${p.state}">${p.state}</span>
      </div>
    </div>
  `;
}

function deckDetailTemplate(
  deck: Deck,
  progress: AppContext["progress"],
  now: number,
  resume: boolean,
): TemplateResult {
  const agg = deckProgress(deck, progress, now);
  return html`
    <div class="detail-hero">
      <h2 class="detail-title">${deck.title}</h2>
      <p class="detail-blurb">${deck.blurb}</p>
      <div class="detail-agg">
        <div class="done-stat">
          <div class="v">${agg.seen}/${agg.total}</div>
          <div class="l">seen</div>
        </div>
        <div class="done-stat">
          <div class="v">${agg.due}</div>
          <div class="l">due now</div>
        </div>
        <div class="done-stat">
          <div class="v good">${agg.known}</div>
          <div class="l">mastered</div>
        </div>
      </div>
      <button class="primary-btn" @click=${() => send(openDeck.create({ deckId: deck.id }))}>
        ${resume ? "Resume review" : "Start review"}
      </button>
    </div>
    <h3 class="detail-list-head">Cards (${deck.cards.length})</h3>
    <div class="card-list">${deck.cards.map((card) => detailCardRow(card, progress, now))}</div>
  `;
}

function renderDeckDetail(snap: Snapshot<AppContext>): void {
  const deckId = snap.context.detailDeckId;
  const deck = deckId ? deckIndex[deckId] : null;
  if (!deck) return;
  const now = Date.now();
  setTopbar(deck.title, "cards in this deck", 0, 0);
  $("tb-count").hidden = true;
  $("tb-progress-wrap").hidden = true;
  show("deck.detail");
  const resume = snap.context.session?.deckId === deck.id;
  render(deckDetailTemplate(deck, snap.context.progress, now, resume), screens["deck.detail"]);
}

/* ---------- stats ---------- */

function statsTemplate(ctx: AppContext, streak: number, longest: number): TemplateResult {
  const days = [...ctx.history].reverse();
  return html`
    <div class="stats-grid">
      <div class="done-stat">
        <div class="v">${streak}</div>
        <div class="l">current streak</div>
      </div>
      <div class="done-stat">
        <div class="v">${longest}</div>
        <div class="l">longest streak</div>
      </div>
      <div class="done-stat">
        <div class="v">${ctx.stats.reviews}</div>
        <div class="l">reviews</div>
      </div>
      <div class="done-stat">
        <div class="v good">${ctx.stats.known}</div>
        <div class="l">known</div>
      </div>
      <div class="done-stat">
        <div class="v bad">${ctx.stats.unknown}</div>
        <div class="l">unknown</div>
      </div>
      <div class="done-stat">
        <div class="v">${ctx.stats.sessions}</div>
        <div class="l">sessions</div>
      </div>
    </div>
    <h3 class="detail-list-head">History</h3>
    ${
      days.length === 0
        ? html`<p class="stats-empty">
            No reviews yet &mdash; finish a session to see your history.
          </p>`
        : html`<div class="day-list">
            ${days.map(
              (h): unknown => html`
                <div class="day-row">
                  <span class="day-date">${h.day}</span>
                  <span class="day-nums">${h.reviews} reviews</span>
                  <span class="day-ok">${h.known} known</span>
                  <span class="day-bad">${h.unknown} unknown</span>
                </div>
              `,
            )}
          </div>`
    }
  `;
}

function renderStats(ctx: AppContext): void {
  setTopbar("Stats", "your learning history", 0, 0);
  $("tb-count").hidden = true;
  $("tb-progress-wrap").hidden = true;
  show("stats");
  const now = Date.now();
  const streak = currentStreak(ctx.history, dayKey(now));
  const longest = longestStreak(ctx.history);
  render(statsTemplate(ctx, streak, longest), screens.stats);
}

/* ---------- settings ---------- */

const PREVIEW_CODE = `const std = @import("std");

pub fn main() void {
    std.debug.print("Powers of two: {} {} {} {}\\n", .{
        twoToThe(1),
        twoToThe(2),
        twoToThe(3),
        twoToThe(4),
    });
}

fn twoToThe(my_number: u32) u32 {
    return std.math.pow(u32, 2, my_number);
}`;

function settingsTemplate(ctx: AppContext): TemplateResult {
  const s = ctx.settings;
  const size = s.codeSize ?? defaultCodeSize();
  const width = s.printWidth ?? DEFAULT_PRINT_WIDTH;
  const setSize = (e: Event): void => {
    send(updateSettings.create({ codeSize: Number((e.target as HTMLInputElement).value) }));
  };
  const setWidth = (e: Event): void => {
    send(updateSettings.create({ printWidth: Number((e.target as HTMLInputElement).value) }));
  };
  return html`
    <h2 class="settings-title">Code display</h2>
    <p class="settings-sub">
      Tune how code blocks fit on your screen. Changes apply everywhere instantly.
    </p>

    <div class="setting-row">
      <div class="setting-head">
        <span class="setting-name">Code size</span>
        <span class="setting-val"
          >${size.toFixed(1)}px${s.codeSize == null ? " &middot; default" : ""}</span
        >
      </div>
      <input
        class="slider"
        type="range"
        min="9"
        max="20"
        step="0.5"
        .value=${String(size)}
        aria-label="Code size"
        @input=${setSize}
      />
      <div class="setting-row-foot">
        <span class="hint">smaller lets more code fit on a phone</span>
        ${
          s.codeSize == null
            ? ""
            : html`<button
                class="link-btn"
                @click=${() => send(updateSettings.create({ codeSize: null }))}
              >
                reset
              </button>`
        }
      </div>
    </div>

    <div class="setting-row">
      <div class="setting-head">
        <span class="setting-name">Print width</span>
        <span class="setting-val"
          >${width} chars/line${s.printWidth == null ? " &middot; default" : ""}</span
        >
      </div>
      <input
        class="slider"
        type="range"
        min="40"
        max="120"
        step="5"
        .value=${String(width)}
        aria-label="Print width"
        @input=${setWidth}
      />
      <div class="setting-row-foot">
        <span class="hint">long lines wrap at this column width</span>
        ${
          s.printWidth == null
            ? ""
            : html`<button
                class="link-btn"
                @click=${() => send(updateSettings.create({ printWidth: null }))}
              >
                reset
              </button>`
        }
      </div>
    </div>

    <div class="setting-row">
      <div class="setting-head">
        <span class="setting-name">Shuffle cards</span>
        <span class="setting-val">${s.shuffle ? "on" : "off"}</span>
      </div>
      <div class="setting-row-foot">
        <span class="hint">mix the deck order for each session</span>
        <label class="switch">
          <input
            type="checkbox"
            aria-label="Shuffle cards"
            .checked=${s.shuffle}
            @change=${(e: Event): void => {
              send(updateSettings.create({ shuffle: (e.target as HTMLInputElement).checked }));
            }}
          />
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-preview">
      <div class="settings-preview-label">Preview</div>
      ${codeBlock(PREVIEW_CODE)}
    </div>
  `;
}

function renderSettings(ctx: AppContext): void {
  setTopbar("Settings", "code display", 0, 0);
  $("tb-count").hidden = true;
  $("tb-progress-wrap").hidden = true;
  show("settings");
  render(settingsTemplate(ctx), screens.settings);
}

/* ---------- error ---------- */

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function renderError(snap: Snapshot<AppContext>): void {
  const err = snap.error;
  setTopbar("Something went wrong", "", 0, 0);
  $("tb-count").hidden = true;
  $("tb-progress-wrap").hidden = true;
  show("error");
  render(
    html`
      <div class="error-box">
        <h2>Something went wrong</h2>
        <p class="error-sub">The app hit an unrecoverable state error and stopped.</p>
        <div class="error-detail">
          <span class="error-reason">${err?.reason ?? "unknown"}</span>
          ${err?.error != null ? html`<code class="error-msg">${errorMessage(err.error)}</code>` : ""}
        </div>
        <button class="primary-btn" @click=${restart}>Restart</button>
      </div>
    `,
    screens.error,
  );
}

function restart(): void {
  boot();
}

function renderApp(snap: Snapshot<AppContext>, prev: Snapshot<AppContext>): void {
  applyCodeSettings(snap.context.settings);
  const [name] = snap.path;
  if (name === "home") renderHome(snap.context);
  else if (name === "section") renderSection(snap.context);
  else if (name === "done") renderDone(snap);
  else if (name === "settings") renderSettings(snap.context);
  else if (name === "credits") renderCredits();
  else if (name === "deck.detail") renderDeckDetail(snap);
  else if (name === "stats") renderStats(snap.context);
  else if (name === "__error") renderError(snap);
  else renderReview(snap, prev);
}

/* ---------- topbar + keyboard ---------- */

$("btn-back").addEventListener("click", () => {
  const state = actor?.snapshot().path[0] ?? "";
  if (state === "settings") send(closeSettings.create());
  else send(backToHome.create());
});

$("btn-settings").addEventListener("click", () => send(openSettings.create()));

document.addEventListener("keydown", (e: KeyboardEvent) => {
  const state = actor?.snapshot().path[0] ?? "";
  if (state === "settings" && e.key === "Escape") {
    e.preventDefault();
    send(closeSettings.create());
    return;
  }
  if (!state.startsWith("review.")) return;
  // grading fly-out: the 240ms animation should finish untouched
  if (state === "review.grading") return;
  // let native controls (grade/skip buttons) handle Space/Enter themselves
  // instead of the global handler swallowing their activation
  const t = e.target as HTMLElement | null;
  if (t && t.closest("button, input, select, textarea, a")) return;
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    send(flip.create());
  } else if (e.key === "ArrowRight") {
    send(grade.create({ known: true }));
  } else if (e.key === "ArrowLeft") {
    send(grade.create({ known: false }));
  } else if (e.key === "s" || e.key === "S") {
    send(skip.create());
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
