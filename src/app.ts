import { html, render, type TemplateResult } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import Prism from "prismjs";
import "prismjs/components/prism-zig.js";
import type { Snapshot } from "@mantaq/core";
import {
  attachPersistence,
  backToHome,
  closeSettings,
  createAppActor,
  deckProgress,
  flip,
  grade,
  initialContext,
  loadPersisted,
  openCredits,
  openDeck,
  openSettings,
  reset,
  resetProgress,
  restartDeck,
  updateSettings,
  type AppActor,
  type AppContext,
  type AppEvent,
  type CodeSettings,
  type DeckIndex,
} from "./machine/index.ts";
import { SECTIONS } from "./sections.ts";
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
  settings: $("screen-settings"),
  credits: $("screen-credits"),
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

type ScreenName = "home" | "review" | "done" | "settings" | "credits" | "error";

let actor: AppActor | null = null;
let deckIndex: DeckIndex = {};

function send(event: AppEvent): void {
  actor?.send(event);
}

function boot(): void {
  deckIndex = Object.fromEntries(window.ZigCards.decks.map((d) => [d.id, d]));
  const base = initialContext();
  const persisted = loadPersisted(localStorage);
  actor = createAppActor({
    decks: deckIndex,
    context: persisted
      ? {
          ...base,
          progress: persisted.cards,
          stats: persisted.stats,
          settings: persisted.settings,
        }
      : base,
  });
  attachPersistence(actor, localStorage);
  actor.on("change", onMachineChange);
}

function onMachineChange(snap: Snapshot<AppContext>, prev: Snapshot<AppContext>): void {
  renderApp(snap, prev);
}

function setTopbar(title: string | null, sub: string | null, idx: number, len: number): void {
  $("tb-title").textContent = title || "ZigCards";
  $("tb-sub").textContent = sub || "";
  if (actor?.snapshot().context.session != null) {
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
  const inSession = actor?.snapshot().context.session != null;
  $("btn-back").hidden = name === "home" || name === "error" || (name === "review" && !inSession);
  $("btn-settings").hidden =
    name === "settings" || name === "credits" || name === "error" || name === "done";
}

/* ---------- home ---------- */

function homeTemplate(ctx: AppContext): TemplateResult {
  const bySection = new Map<string, Deck[]>();
  for (const deck of window.ZigCards.decks) {
    const list = bySection.get(deck.section) ?? [];
    list.push(deck);
    bySection.set(deck.section, list);
  }
  const sections = SECTIONS.filter((s) => bySection.has(s.id)).sort((a, b) => a.order - b.order);
  return html`
    <div class="hero">
      <h1>ZigCards</h1>
      <p>
        Flashcards for learning Zig &mdash; with the memory basics JavaScript never made you learn.
      </p>
    </div>
    ${sections.map(
      (sec): unknown => html`
        <div class="section-head">
          <span class="section-num">${String(sec.order)}</span>
          <span class="section-meta">
            <span class="section-title">${sec.title}</span>
            <br /><span class="section-blurb">${sec.blurb}</span>
          </span>
        </div>
        ${bySection
          .get(sec.id)!
          .slice()
          .sort((a, b) => a.order - b.order)
          .map(
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
      `,
    )}
    <div class="footer-note">
      ${ctx.stats.reviews > 0 ? html`${ctx.stats.reviews} review${ctx.stats.reviews === 1 ? "" : "s"} done &middot; ` : ""}
      <button @click=${() => send(openCredits.create())}>Thanks &amp; acknowledgements</button>
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

/* ---------- credits ---------- */

const ZIGLINGS_URL = "https://codeberg.org/ziglings/exercises";
const ZIG_URL = "https://ziglang.org";

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
      <h3>Tech</h3>
      <p>
        Built with <a href="https://lit.dev" target="_blank" rel="noopener noreferrer">lit-html</a>,
        <a href="https://github.com/AndersCan/mantaq" target="_blank" rel="noopener noreferrer"
          >Mantaq</a
        >, <a href="https://prismjs.com" target="_blank" rel="noopener noreferrer">Prism</a>, and
        <a href="https://viteplus.dev" target="_blank" rel="noopener noreferrer">Vite+</a>.
      </p>
    </div>
  `;
}

function renderCredits(): void {
  setTopbar("ZigCards", "thanks & acknowledgements", 0, 0);
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
  $("btn-settings").hidden = grading;
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
  else if (name === "done") renderDone(snap);
  else if (name === "settings") renderSettings(snap.context);
  else if (name === "credits") renderCredits();
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
