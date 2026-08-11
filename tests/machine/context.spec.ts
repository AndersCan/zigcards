import { describe, expect, it } from "vite-plus/test";
import {
  advanceSession,
  cardProgress,
  clearSession,
  deckProgress,
  emptyStats,
  gradeCard,
  initialContext,
  recordReview,
  resetProgress,
  restartSession,
  startSession,
  updateCodeSettings,
} from "../../src/machine/context.ts";
import type { AppContext } from "../../src/machine/types.ts";
import type { Card, Deck } from "../../src/types.ts";

function makeDeck(id: string, count: number): Deck {
  const cards: Card[] = Array.from({ length: count }, (_, i) => ({
    id: `${id}-${i}`,
    source: "test",
    type: "concept",
    front: `${id} front ${i}`,
    back: `${id} back ${i}`,
  }));
  return { id, title: id, order: 1, blurb: "test deck", section: "zig", cards };
}

function inSession(ctx: AppContext): AppContext {
  return startSession(ctx, "d1");
}

describe("context helpers", () => {
  it("builds an empty initial context", () => {
    expect(initialContext()).toEqual({
      session: null,
      lastGrade: null,
      progress: {},
      stats: emptyStats(),
      settings: { codeSize: null, printWidth: null },
      settingsFrom: null,
    });
  });

  it("updateCodeSettings merges a patch without mutating", () => {
    const ctx = updateCodeSettings(initialContext(), { codeSize: 15 });
    expect(ctx.settings).toEqual({ codeSize: 15, printWidth: null });
    expect(initialContext().settings).toEqual({ codeSize: null, printWidth: null });
    expect(updateCodeSettings(ctx, { printWidth: 70 }).settings).toEqual({
      codeSize: 15,
      printWidth: 70,
    });
  });

  it("startSession opens a fresh session", () => {
    const ctx = inSession(initialContext());
    expect(ctx.session).toEqual({ deckId: "d1", idx: 0, known: 0, unknown: 0 });
    expect(ctx.lastGrade).toBeNull();
  });

  it("gradeCard bumps counters and sets lastGrade", () => {
    const ctx = gradeCard(inSession(initialContext()), true);
    expect(ctx.session?.known).toBe(1);
    expect(ctx.session?.unknown).toBe(0);
    expect(ctx.lastGrade).toEqual({ known: true });
  });

  it("gradeCard is a no-op without a session", () => {
    const ctx = gradeCard(initialContext(), true);
    expect(ctx).toEqual(initialContext());
  });

  it("advanceSession advances idx", () => {
    const ctx = advanceSession(inSession(initialContext()));
    expect(ctx.session?.idx).toBe(1);
  });

  it("clearSession nulls session and lastGrade", () => {
    let ctx = inSession(initialContext());
    ctx = gradeCard(ctx, false);
    const cleared = clearSession(ctx);
    expect(cleared.session).toBeNull();
    expect(cleared.lastGrade).toBeNull();
  });

  it("restartSession keeps the deck but resets counters and idx", () => {
    let ctx = inSession(initialContext());
    ctx = advanceSession(ctx);
    ctx = gradeCard(ctx, true);
    const restarted = restartSession(ctx);
    expect(restarted.session).toEqual({ deckId: "d1", idx: 0, known: 0, unknown: 0 });
    expect(restarted.lastGrade).toBeNull();
  });

  it("recordReview accumulates per-card progress and stats", () => {
    let ctx = recordReview(inSession(initialContext()), "d1-0", true, 10);
    ctx = recordReview(ctx, "d1-0", false, 20);
    ctx = recordReview(ctx, "d1-1", true, 30);
    expect(ctx.progress["d1-0"]).toEqual({ seen: 2, known: 1, unknown: 1, last: 20 });
    expect(ctx.progress["d1-1"]).toEqual({ seen: 1, known: 1, unknown: 0, last: 30 });
    expect(ctx.stats).toEqual({ sessions: 0, reviews: 3, known: 2, unknown: 1 });
  });

  it("recordReview does not touch the session", () => {
    const base = inSession(initialContext());
    const ctx = recordReview(base, "d1-0", true, 1);
    expect(ctx.session).toEqual(base.session);
    expect(ctx.lastGrade).toBeNull();
  });

  it("cardProgress defaults to zeros", () => {
    expect(cardProgress({}, "missing")).toEqual({ seen: 0, known: 0, unknown: 0, last: 0 });
  });

  it("deckProgress aggregates seen/known/total", () => {
    const deck = makeDeck("d1", 3);
    let ctx = recordReview(initialContext(), "d1-0", true, 1);
    ctx = recordReview(ctx, "d1-1", true, 2);
    ctx = recordReview(ctx, "d1-1", false, 3);
    expect(deckProgress(deck, ctx.progress)).toEqual({ seen: 2, known: 1, total: 3 });
  });

  it("resetProgress clears progress and stats", () => {
    const deck = makeDeck("d1", 1);
    let ctx = recordReview(inSession(initialContext()), "d1-0", true, 1);
    ctx = resetProgress(ctx);
    expect(ctx.progress).toEqual({});
    expect(ctx.stats.reviews).toBe(0);
    expect(ctx.session).not.toBeNull();
    expect(deckProgress(deck, ctx.progress).seen).toBe(0);
  });

  it("helpers never mutate the input context", () => {
    const base = inSession(initialContext());
    const before = JSON.stringify(base);
    recordReview(base, "d1-0", true, 1);
    gradeCard(base, true);
    advanceSession(base);
    clearSession(base);
    expect(JSON.stringify(base)).toBe(before);
  });
});
