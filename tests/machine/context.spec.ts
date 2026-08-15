import { describe, expect, it } from "vite-plus/test";
import {
  DAY_MS,
  advanceSession,
  beginSession,
  buildQueue,
  cardProgress,
  clearSession,
  currentStreak,
  dayKey,
  deckProgress,
  emptyStats,
  gradeCard,
  initialContext,
  longestStreak,
  newCardProgress,
  pauseSession,
  previousDay,
  recordDayHistory,
  recordReview,
  resetProgress,
  scheduleCard,
  shuffleInPlace,
  skipCard,
  startSession,
  updateCodeSettings,
} from "../../src/machine/context.ts";
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

describe("context helpers", () => {
  it("builds an empty initial context", () => {
    expect(initialContext()).toEqual({
      session: null,
      lastGrade: null,
      progress: {},
      stats: emptyStats(),
      history: [],
      settings: { codeSize: null, printWidth: null, shuffle: false },
      settingsFrom: null,
      detailDeckId: null,
      sectionId: null,
    });
  });

  it("updateCodeSettings merges a patch without mutating", () => {
    const ctx = updateCodeSettings(initialContext(), { codeSize: 15 });
    expect(ctx.settings).toEqual({ codeSize: 15, printWidth: null, shuffle: false });
    expect(initialContext().settings).toEqual({
      codeSize: null,
      printWidth: null,
      shuffle: false,
    });
    expect(updateCodeSettings(ctx, { shuffle: true }).settings).toEqual({
      codeSize: 15,
      printWidth: null,
      shuffle: true,
    });
  });

  it("newCardProgress has the SM-2 defaults", () => {
    expect(newCardProgress()).toEqual({
      seen: 0,
      known: 0,
      unknown: 0,
      last: 0,
      state: "new",
      due: 0,
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
    });
  });

  it("scheduleCard: first known schedules a 1-day review", () => {
    const next = scheduleCard(newCardProgress(), true, 100);
    expect(next.state).toBe("review");
    expect(next.interval).toBe(1);
    expect(next.due).toBe(100 + DAY_MS);
    expect(next.reps).toBe(1);
    expect(next.ease).toBeCloseTo(2.6);
    expect(next.seen).toBe(1);
    expect(next.known).toBe(1);
  });

  it("scheduleCard: second and third known grow the interval", () => {
    let p = scheduleCard(newCardProgress(), true, 0);
    p = scheduleCard(p, true, DAY_MS);
    expect(p.interval).toBe(3);
    p = scheduleCard(p, true, 2 * DAY_MS);
    // 3 * ease(2.6) rounds to 8
    expect(p.interval).toBe(8);
    expect(p.reps).toBe(3);
  });

  it("scheduleCard: an unknown resets to relearning and bumps lapses", () => {
    let p = scheduleCard(newCardProgress(), true, 0);
    p = scheduleCard(p, false, DAY_MS);
    expect(p.state).toBe("relearning");
    expect(p.interval).toBe(1);
    expect(p.due).toBe(DAY_MS + DAY_MS);
    expect(p.reps).toBe(0);
    expect(p.lapses).toBe(1);
    expect(p.ease).toBeCloseTo(2.4);
    expect(p.unknown).toBe(1);
  });

  it("scheduleCard: ease stays within bounds", () => {
    let p = scheduleCard(newCardProgress(), true, 0);
    p = scheduleCard(p, true, DAY_MS);
    p = scheduleCard(p, true, 2 * DAY_MS);
    p = scheduleCard(p, true, 3 * DAY_MS);
    expect(p.ease).toBeLessThanOrEqual(3.0);
    let q = newCardProgress();
    for (let i = 0; i < 10; i++) q = scheduleCard(q, false, i * DAY_MS);
    expect(q.ease).toBeGreaterThanOrEqual(1.3);
  });

  it("startSession builds an empty fresh session", () => {
    expect(startSession("d1", [0, 1, 2])).toEqual({
      deckId: "d1",
      order: [0, 1, 2],
      idx: 0,
      known: 0,
      unknown: 0,
      skipped: 0,
      skippedCards: [],
      missed: [],
    });
  });

  it("beginSession sets the session and bumps the sessions stat", () => {
    const ctx = beginSession(initialContext(), "d1", [0, 1]);
    expect(ctx.session?.deckId).toBe("d1");
    expect(ctx.session?.idx).toBe(0);
    expect(ctx.stats.sessions).toBe(1);
    expect(ctx.lastGrade).toBeNull();
  });

  it("gradeCard bumps counters, tracks missed, and sets lastGrade", () => {
    let ctx = beginSession(initialContext(), "d1", [0]);
    ctx = gradeCard(ctx, "d1-0", false);
    expect(ctx.session?.known).toBe(0);
    expect(ctx.session?.unknown).toBe(1);
    expect(ctx.session?.missed).toEqual(["d1-0"]);
    expect(ctx.lastGrade).toEqual({ known: false });
    // a second unknown on the same card is not double-counted in missed
    ctx = gradeCard(ctx, "d1-0", false);
    expect(ctx.session?.missed).toEqual(["d1-0"]);
  });

  it("gradeCard is a no-op without a session", () => {
    const ctx = gradeCard(initialContext(), "c1", true);
    expect(ctx).toEqual(initialContext());
  });

  it("skipCard re-queues the current card at the end", () => {
    let ctx = beginSession(initialContext(), "d1", [0, 1, 2]);
    ctx = skipCard(ctx, "c0");
    expect(ctx.session?.order).toEqual([1, 2, 0]);
    expect(ctx.session?.idx).toBe(0);
    expect(ctx.session?.skipped).toBe(1);
    expect(ctx.session?.skippedCards).toEqual(["c0"]);
  });

  it("skipCard on the last card finishes the session", () => {
    let ctx = beginSession(initialContext(), "d1", [0]);
    ctx = skipCard(ctx, "c0");
    expect(ctx.session?.idx).toBe(1);
    expect(ctx.session?.skipped).toBe(1);
  });

  it("skipCard terminates when every card has been skipped", () => {
    let ctx = beginSession(initialContext(), "d1", [0, 1, 2]);
    ctx = skipCard(ctx, "c0");
    ctx = skipCard(ctx, "c1");
    ctx = skipCard(ctx, "c2");
    expect(ctx.session?.order).toEqual([0, 1, 2]);
    expect(ctx.session?.idx).toBe(0);
    expect(ctx.session?.skipped).toBe(3);
    expect(ctx.session?.skippedCards).toEqual(["c0", "c1", "c2"]);
    // a card skipped before is passed rather than re-queued
    ctx = skipCard(ctx, "c0");
    expect(ctx.session?.idx).toBe(1);
    expect(ctx.session?.order).toEqual([0, 1, 2]);
    ctx = skipCard(ctx, "c1");
    expect(ctx.session?.idx).toBe(2);
    ctx = skipCard(ctx, "c2");
    expect(ctx.session?.idx).toBe(3);
  });

  it("advanceSession advances idx", () => {
    let ctx = beginSession(initialContext(), "d1", [0, 1]);
    ctx = advanceSession(ctx);
    expect(ctx.session?.idx).toBe(1);
  });

  it("clearSession nulls session and lastGrade; pauseSession only drops lastGrade", () => {
    let ctx = beginSession(initialContext(), "d1", [0]);
    ctx = gradeCard(ctx, "d1-0", true);
    expect(pauseSession(ctx).session).not.toBeNull();
    expect(pauseSession(ctx).lastGrade).toBeNull();
    expect(clearSession(ctx).session).toBeNull();
    expect(clearSession(ctx).lastGrade).toBeNull();
  });

  it("buildQueue includes new and due cards, in deck order by default", () => {
    const deck = makeDeck("d1", 3);
    let ctx = recordReview(initialContext(), "d1-0", true, 0);
    ctx = recordReview(ctx, "d1-1", true, 0);
    // card 0 is due tomorrow, card 1 is due tomorrow; card 2 is new
    expect(buildQueue(deck, ctx.progress, { now: 0 })).toEqual([2]);
    expect(buildQueue(deck, ctx.progress, { now: DAY_MS + 1 })).toEqual([0, 1, 2]);
  });

  it("buildQueue force includes every card regardless of schedule", () => {
    const deck = makeDeck("d1", 2);
    const ctx = recordReview(initialContext(), "d1-0", true, 0);
    expect(buildQueue(deck, ctx.progress, { now: 0, force: true })).toEqual([0, 1]);
  });

  it("buildQueue only restricts to the given card ids", () => {
    const deck = makeDeck("d1", 3);
    expect(buildQueue(deck, {}, { now: 0, only: ["d1-2", "d1-0"] })).toEqual([0, 2]);
  });

  it("buildQueue shuffles when asked", () => {
    const deck = makeDeck("d1", 5);
    const seq = [0.9, 0.5, 0.3, 0.1];
    let i = 0;
    const queue = buildQueue(
      deck,
      {},
      { now: 0, shuffle: true, random: () => seq[i++ % seq.length] },
    );
    expect([...queue].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
    expect(queue).not.toEqual([0, 1, 2, 3, 4]);
  });

  it("shuffleInPlace is deterministic for a given random source", () => {
    const a = [0, 1, 2, 3, 4];
    const b = [0, 1, 2, 3, 4];
    const rng = (): number => 0.42;
    expect(shuffleInPlace(a, rng)).toEqual(shuffleInPlace(b, rng));
  });

  it("dayKey and previousDay are ISO-style local dates", () => {
    expect(dayKey(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(previousDay("2026-03-01")).toBe("2026-02-28");
    expect(previousDay("2026-01-01")).toBe("2025-12-31");
  });

  it("recordDayHistory merges same-day entries and appends new days", () => {
    let h = recordDayHistory([], "2026-08-01", true);
    h = recordDayHistory(h, "2026-08-01", false);
    expect(h).toEqual([{ day: "2026-08-01", reviews: 2, known: 1, unknown: 1 }]);
    h = recordDayHistory(h, "2026-08-02", true);
    expect(h).toEqual([
      { day: "2026-08-01", reviews: 2, known: 1, unknown: 1 },
      { day: "2026-08-02", reviews: 1, known: 1, unknown: 0 },
    ]);
  });

  it("currentStreak counts consecutive days ending today or yesterday", () => {
    const h = recordDayHistory(recordDayHistory([], "2026-08-01", true), "2026-08-02", true);
    expect(currentStreak(h, "2026-08-02")).toBe(2);
    expect(currentStreak(h, "2026-08-03")).toBe(2); // last active day was yesterday
    expect(currentStreak(h, "2026-08-04")).toBe(0);
    expect(currentStreak([], "2026-08-04")).toBe(0);
    const broken = recordDayHistory(h, "2026-08-10", true);
    expect(currentStreak(broken, "2026-08-10")).toBe(1);
  });

  it("longestStreak spans the whole history", () => {
    const h = [
      { day: "2026-08-01", reviews: 1, known: 1, unknown: 0 },
      { day: "2026-08-02", reviews: 1, known: 1, unknown: 0 },
      { day: "2026-08-05", reviews: 1, known: 1, unknown: 0 },
      { day: "2026-08-06", reviews: 1, known: 1, unknown: 0 },
      { day: "2026-08-07", reviews: 1, known: 1, unknown: 0 },
    ];
    expect(longestStreak(h)).toBe(3);
    expect(longestStreak([])).toBe(0);
  });

  it("recordReview applies the schedule, stats, and history without touching the session", () => {
    let ctx = beginSession(initialContext(), "d1", [0, 1]);
    ctx = recordReview(ctx, "d1-0", true, 10);
    expect(ctx.progress["d1-0"]?.state).toBe("review");
    expect(ctx.progress["d1-0"]?.due).toBe(10 + DAY_MS);
    expect(ctx.stats).toEqual({ sessions: 1, reviews: 1, known: 1, unknown: 0 });
    expect(ctx.history[0]).toEqual({
      day: ctx.history[0]!.day,
      reviews: 1,
      known: 1,
      unknown: 0,
    });
    expect(ctx.session?.deckId).toBe("d1");
    expect(ctx.lastGrade).toBeNull();
  });

  it("cardProgress defaults to an unscheduled card", () => {
    expect(cardProgress({}, "missing")).toEqual(newCardProgress());
  });

  it("deckProgress aggregates seen/due/known/total", () => {
    const deck = makeDeck("d1", 3);
    let ctx = recordReview(initialContext(), "d1-0", true, 0);
    ctx = recordReview(ctx, "d1-1", true, 0);
    ctx = recordReview(ctx, "d1-1", false, 0);
    // both cards were just reviewed, so they are not due until tomorrow
    expect(deckProgress(deck, ctx.progress, 0)).toEqual({ seen: 2, due: 0, known: 1, total: 3 });
    expect(deckProgress(deck, ctx.progress, DAY_MS + 1)).toEqual({
      seen: 2,
      due: 2,
      known: 1,
      total: 3,
    });
    // known > unknown marks a card "known"; a due-0 card counts as due
    expect(
      deckProgress(deck, { "d1-0": { ...newCardProgress(), seen: 2, known: 2, unknown: 1 } }, 0),
    ).toEqual({ seen: 1, due: 1, known: 1, total: 3 });
  });

  it("resetProgress clears progress, stats, and history", () => {
    let ctx = recordReview(beginSession(initialContext(), "d1", [0]), "d1-0", true, 1);
    ctx = resetProgress(ctx);
    expect(ctx.progress).toEqual({});
    expect(ctx.history).toEqual([]);
    expect(ctx.stats.reviews).toBe(0);
    expect(ctx.session).not.toBeNull();
  });

  it("helpers never mutate the input context", () => {
    const base = beginSession(initialContext(), "d1", [0, 1]);
    const before = JSON.stringify(base);
    recordReview(base, "d1-0", true, 1);
    gradeCard(base, "d1-0", true);
    advanceSession(base);
    clearSession(base);
    skipCard(base, "c0");
    updateCodeSettings(base, { shuffle: true });
    expect(JSON.stringify(base)).toBe(before);
  });
});
