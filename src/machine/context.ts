import type { Deck } from "../types.ts";
import type { AppContext, CardProgress, CodeSettings, SessionState, Stats } from "./types.ts";

export function emptyStats(): Stats {
  return { sessions: 0, reviews: 0, known: 0, unknown: 0 };
}

export function defaultCodeSettings(): CodeSettings {
  return { codeSize: null, printWidth: null };
}

export function initialContext(): AppContext {
  return {
    session: null,
    lastGrade: null,
    progress: {},
    stats: emptyStats(),
    settings: defaultCodeSettings(),
    settingsFrom: null,
  };
}

export function updateCodeSettings(ctx: AppContext, patch: Partial<CodeSettings>): AppContext {
  return { ...ctx, settings: { ...ctx.settings, ...patch } };
}

export function startSession(ctx: AppContext, deckId: string): AppContext {
  return { ...ctx, session: { deckId, idx: 0, known: 0, unknown: 0 }, lastGrade: null };
}

export function gradeCard(ctx: AppContext, known: boolean): AppContext {
  if (!ctx.session) return ctx;
  const session: SessionState = {
    ...ctx.session,
    known: ctx.session.known + (known ? 1 : 0),
    unknown: ctx.session.unknown + (known ? 0 : 1),
  };
  return { ...ctx, session, lastGrade: { known } };
}

export function advanceSession(ctx: AppContext): AppContext {
  if (!ctx.session) return ctx;
  return { ...ctx, session: { ...ctx.session, idx: ctx.session.idx + 1 } };
}

export function clearSession(ctx: AppContext): AppContext {
  return { ...ctx, session: null, lastGrade: null };
}

export function restartSession(ctx: AppContext): AppContext {
  if (!ctx.session) return ctx;
  return { ...ctx, session: { ...ctx.session, idx: 0, known: 0, unknown: 0 }, lastGrade: null };
}

export function recordReview(
  ctx: AppContext,
  cardId: string,
  known: boolean,
  now: number,
): AppContext {
  const prev = ctx.progress[cardId];
  const next: CardProgress = {
    seen: (prev?.seen ?? 0) + 1,
    known: (prev?.known ?? 0) + (known ? 1 : 0),
    unknown: (prev?.unknown ?? 0) + (known ? 0 : 1),
    last: now,
  };
  return {
    ...ctx,
    progress: { ...ctx.progress, [cardId]: next },
    stats: {
      sessions: ctx.stats.sessions,
      reviews: ctx.stats.reviews + 1,
      known: ctx.stats.known + (known ? 1 : 0),
      unknown: ctx.stats.unknown + (known ? 0 : 1),
    },
  };
}

export function resetProgress(ctx: AppContext): AppContext {
  return { ...ctx, progress: {}, stats: emptyStats() };
}

export function cardProgress(progress: Record<string, CardProgress>, cardId: string): CardProgress {
  return progress[cardId] ?? { seen: 0, known: 0, unknown: 0, last: 0 };
}

export function deckProgress(
  deck: Deck,
  progress: Record<string, CardProgress>,
): { seen: number; known: number; total: number } {
  let seen = 0;
  let known = 0;
  for (const c of deck.cards) {
    const p = progress[c.id];
    if (p) {
      seen += 1;
      if (p.known > p.unknown) known += 1;
    }
  }
  return { seen, known, total: deck.cards.length };
}
