import type { Deck } from "../types.ts";
import type {
  AppContext,
  CardProgress,
  CodeSettings,
  DayStats,
  SessionState,
  Stats,
} from "./types.ts";

export const DAY_MS = 86_400_000;
export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_EASE = 3.0;
export const MAX_INTERVAL_DAYS = 365;

function clampEase(ease: number): number {
  return Math.min(MAX_EASE, Math.max(MIN_EASE, ease));
}

export function newCardProgress(): CardProgress {
  return {
    seen: 0,
    known: 0,
    unknown: 0,
    last: 0,
    state: "new",
    due: 0,
    interval: 0,
    ease: DEFAULT_EASE,
    reps: 0,
    lapses: 0,
  };
}

export function emptyStats(): Stats {
  return { sessions: 0, reviews: 0, known: 0, unknown: 0 };
}

export function defaultCodeSettings(): CodeSettings {
  return { codeSize: null, printWidth: null, shuffle: false };
}

export function initialContext(): AppContext {
  return {
    session: null,
    lastGrade: null,
    progress: {},
    stats: emptyStats(),
    history: [],
    settings: defaultCodeSettings(),
    settingsFrom: null,
    detailDeckId: null,
    sectionId: null,
  };
}

export function updateCodeSettings(ctx: AppContext, patch: Partial<CodeSettings>): AppContext {
  return { ...ctx, settings: { ...ctx.settings, ...patch } };
}

/* ---------- SRS scheduling ---------- */

export function scheduleCard(prev: CardProgress, known: boolean, now: number): CardProgress {
  const ease = clampEase(prev.ease + (known ? 0.1 : -0.2));
  if (known) {
    const reps = prev.reps + 1;
    let interval: number;
    if (reps <= 1) interval = 1;
    else if (reps === 2) interval = 3;
    else {
      interval = Math.min(MAX_INTERVAL_DAYS, Math.round(prev.interval * prev.ease));
      interval = Math.max(interval, prev.interval + 1);
    }
    return {
      ...prev,
      seen: prev.seen + 1,
      known: prev.known + 1,
      last: now,
      state: "review",
      due: now + interval * DAY_MS,
      interval,
      ease,
      reps,
    };
  }
  return {
    ...prev,
    seen: prev.seen + 1,
    unknown: prev.unknown + 1,
    last: now,
    state: "relearning",
    due: now + DAY_MS,
    interval: 1,
    ease,
    reps: 0,
    lapses: prev.lapses + 1,
  };
}

/* ---------- session queue ---------- */

export interface QueueOptions {
  now: number;
  shuffle?: boolean;
  random?: () => number;
  force?: boolean;
  only?: string[];
}

export function shuffleInPlace<T>(items: T[], random: () => number = Math.random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** Build the presentation order (deck-card indices) for a session.
 *  By default: new cards (never seen) + cards whose schedule is due.
 *  `force` includes every card; `only` restricts to the given card ids. */
export function buildQueue(
  deck: Deck,
  progress: Record<string, CardProgress>,
  opts: QueueOptions,
): number[] {
  const { now, shuffle = false, random = Math.random, force = false, only } = opts;
  const indices: number[] = [];
  deck.cards.forEach((card, i) => {
    if (only && !only.includes(card.id)) return;
    if (!force && !only) {
      const p = progress[card.id];
      if (p && p.due > now) return;
    }
    indices.push(i);
  });
  if (shuffle) shuffleInPlace(indices, random);
  return indices;
}

/* ---------- session lifecycle ---------- */

export function startSession(deckId: string, order: number[]): SessionState {
  return { deckId, order, idx: 0, known: 0, unknown: 0, skipped: 0, skippedCards: [], missed: [] };
}

/** Start a fresh session: counters reset, sessions stat bumped. */
export function beginSession(ctx: AppContext, deckId: string, order: number[]): AppContext {
  return {
    ...ctx,
    session: startSession(deckId, order),
    lastGrade: null,
    stats: { ...ctx.stats, sessions: ctx.stats.sessions + 1 },
  };
}

export function gradeCard(ctx: AppContext, cardId: string, known: boolean): AppContext {
  if (!ctx.session) return ctx;
  const s = ctx.session;
  const missed = !known && !s.missed.includes(cardId) ? [...s.missed, cardId] : s.missed;
  return {
    ...ctx,
    session: {
      ...s,
      known: s.known + (known ? 1 : 0),
      unknown: s.unknown + (known ? 0 : 1),
      missed,
    },
    lastGrade: { known },
  };
}

/** Skip the current card. First skip re-queues it at the end of the session;
 *  a card already skipped (or the last one remaining) is passed instead, so
 *  skipping every card always terminates. */
export function skipCard(ctx: AppContext, cardId: string): AppContext {
  if (!ctx.session) return ctx;
  const s = ctx.session;
  const alreadySkipped = s.skippedCards.includes(cardId);
  const finish = alreadySkipped || s.idx >= s.order.length - 1;
  if (finish) {
    const skippedCards = alreadySkipped ? s.skippedCards : [...s.skippedCards, cardId];
    return {
      ...ctx,
      session: { ...s, idx: s.idx + 1, skipped: s.skipped + 1, skippedCards },
    };
  }
  const current = s.order[s.idx];
  const order = [...s.order.slice(0, s.idx), ...s.order.slice(s.idx + 1), current];
  return {
    ...ctx,
    session: {
      ...s,
      order,
      skipped: s.skipped + 1,
      skippedCards: [...s.skippedCards, cardId],
    },
  };
}

export function advanceSession(ctx: AppContext): AppContext {
  if (!ctx.session) return ctx;
  return { ...ctx, session: { ...ctx.session, idx: ctx.session.idx + 1 } };
}

export function clearSession(ctx: AppContext): AppContext {
  return { ...ctx, session: null, lastGrade: null };
}

export function pauseSession(ctx: AppContext): AppContext {
  return { ...ctx, lastGrade: null };
}

/* ---------- history & streaks ---------- */

export function dayKey(now: number): string {
  const d = new Date(now);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function previousDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return dayKey(dt.getTime());
}

export function recordDayHistory(history: DayStats[], day: string, known: boolean): DayStats[] {
  const last = history[history.length - 1];
  if (last && last.day === day) {
    return [
      ...history.slice(0, -1),
      {
        day,
        reviews: last.reviews + 1,
        known: last.known + (known ? 1 : 0),
        unknown: last.unknown + (known ? 0 : 1),
      },
    ];
  }
  return [...history, { day, reviews: 1, known: known ? 1 : 0, unknown: known ? 0 : 1 }];
}

export function currentStreak(history: DayStats[], todayKey: string): number {
  if (history.length === 0) return 0;
  const last = history[history.length - 1];
  if (last.day !== todayKey && last.day !== previousDay(todayKey)) return 0;
  let streak = 0;
  let expected = last.day;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].day !== expected) break;
    streak += 1;
    expected = previousDay(expected);
  }
  return streak;
}

export function longestStreak(history: DayStats[]): number {
  let best = 0;
  let current = 0;
  let prev: string | null = null;
  for (const h of history) {
    current = prev === null || previousDay(h.day) === prev ? current + 1 : 1;
    if (current > best) best = current;
    prev = h.day;
  }
  return best;
}

/* ---------- recording ---------- */

export function recordReview(
  ctx: AppContext,
  cardId: string,
  known: boolean,
  now: number,
): AppContext {
  const prev = cardProgress(ctx.progress, cardId);
  const next = scheduleCard(prev, known, now);
  return {
    ...ctx,
    progress: { ...ctx.progress, [cardId]: next },
    stats: {
      ...ctx.stats,
      reviews: ctx.stats.reviews + 1,
      known: ctx.stats.known + (known ? 1 : 0),
      unknown: ctx.stats.unknown + (known ? 0 : 1),
    },
    history: recordDayHistory(ctx.history, dayKey(now), known),
  };
}

export function resetProgress(ctx: AppContext): AppContext {
  return { ...ctx, progress: {}, stats: emptyStats(), history: [] };
}

/* ---------- aggregation ---------- */

export function cardProgress(progress: Record<string, CardProgress>, cardId: string): CardProgress {
  return progress[cardId] ?? newCardProgress();
}

export function deckProgress(
  deck: Deck,
  progress: Record<string, CardProgress>,
  now = 0,
): { seen: number; due: number; known: number; total: number } {
  let seen = 0;
  let due = 0;
  let known = 0;
  for (const c of deck.cards) {
    const p = progress[c.id];
    if (!p) continue;
    seen += 1;
    if (p.known > p.unknown) known += 1;
    if (p.due <= now) due += 1;
  }
  return { seen, due, known, total: deck.cards.length };
}
