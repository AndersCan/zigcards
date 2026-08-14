import { describe, expect, it } from "vite-plus/test";
import { VirtualClock } from "@mantaq/core";
import { matches } from "@mantaq/sugar";
import {
  DAY_MS,
  currentStreak,
  dayKey,
  longestStreak,
  previousDay,
} from "../../src/machine/context.ts";
import { GRADE_FLYOUT_MS, createAppActor } from "../../src/machine/machine.ts";
import { backToHome, flip, grade, openDeck } from "../../src/machine/refs.ts";
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

function makeApp(count = 1) {
  const deck = makeDeck("d1", count);
  const clock = new VirtualClock();
  const actor = createAppActor({ decks: { d1: deck }, clock });
  return { actor, clock, deck };
}

/** Open the deck and grade the single presented card, running out the fly-out. */
function runSession(
  actor: ReturnType<typeof createAppActor>,
  clock: VirtualClock,
  known: boolean,
): void {
  actor.send(openDeck.create({ deckId: "d1" }));
  actor.send(flip.create());
  actor.send(grade.create({ known }));
  clock.advance(GRADE_FLYOUT_MS);
}

/** Finish the current card's review (FLIP → GRADE → fly-out). */
function review(
  actor: ReturnType<typeof createAppActor>,
  clock: VirtualClock,
  known: boolean,
): void {
  actor.send(flip.create());
  actor.send(grade.create({ known }));
  clock.advance(GRADE_FLYOUT_MS);
}

describe("zigcards srs scheduling through the machine", () => {
  it("a brand-new card graded known becomes a 1-day review", () => {
    const { actor, clock } = makeApp(1);
    runSession(actor, clock, true);
    expect(matches(actor, "done")).toBe(true);
    const p = actor.snapshot().context.progress["d1-0"];
    expect(p?.state).toBe("review");
    expect(p?.interval).toBe(1);
    expect(p?.due).toBe(DAY_MS);
    expect(p?.ease).toBeCloseTo(2.6);
    expect(p?.reps).toBe(1);
  });

  it("second and third consecutive known days grow the interval through the machine", () => {
    const { actor, clock } = makeApp(1);
    runSession(actor, clock, true);
    actor.send(backToHome.create());
    clock.advance(DAY_MS);
    runSession(actor, clock, true);
    let p = actor.snapshot().context.progress["d1-0"];
    expect(p?.interval).toBe(3);
    expect(p?.due).toBe((p?.last ?? 0) + 3 * DAY_MS);
    actor.send(backToHome.create());
    clock.advance(3 * DAY_MS);
    runSession(actor, clock, true);
    p = actor.snapshot().context.progress["d1-0"];
    expect(p?.interval).toBe(8);
    expect(p?.due).toBe((p?.last ?? 0) + 8 * DAY_MS);
    expect(clock.hasPending()).toBe(false);
  });

  it("an unknown sends the card to relearning with lapses and a lower ease", () => {
    const { actor, clock } = makeApp(1);
    runSession(actor, clock, false);
    expect(matches(actor, "done")).toBe(true);
    const p = actor.snapshot().context.progress["d1-0"];
    expect(p?.state).toBe("relearning");
    expect(p?.interval).toBe(1);
    expect(p?.due).toBe(DAY_MS);
    expect(p?.lapses).toBe(1);
    expect(p?.reps).toBe(0);
    expect(p?.ease).toBeCloseTo(2.3);
  });

  it("a known after a lapse returns the card to review", () => {
    const { actor, clock } = makeApp(1);
    runSession(actor, clock, false);
    actor.send(backToHome.create());
    clock.advance(DAY_MS);
    runSession(actor, clock, true);
    const p = actor.snapshot().context.progress["d1-0"];
    expect(p?.state).toBe("review");
    expect(p?.interval).toBe(1);
    expect(p?.reps).toBe(1);
    expect(p?.lapses).toBe(1);
    expect(p?.ease).toBeCloseTo(2.4);
  });

  it("repeated unknowns floor the ease at 1.3 and keep counting lapses", () => {
    const { actor, clock } = makeApp(1);
    for (let i = 0; i < 7; i++) {
      runSession(actor, clock, false);
      expect(matches(actor, "done")).toBe(true);
      if (i < 6) {
        actor.send(backToHome.create());
        clock.advance(DAY_MS);
      }
    }
    const p = actor.snapshot().context.progress["d1-0"];
    expect(p?.ease).toBe(1.3);
    expect(p?.lapses).toBe(7);
    expect(p?.state).toBe("relearning");
    expect(p?.interval).toBe(1);
    expect(p?.reps).toBe(0);
    expect(clock.hasPending()).toBe(false);
  });

  it("a fresh openDeck reaches done with an empty queue when all cards are scheduled", () => {
    const { actor, clock, deck } = makeApp(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    for (let i = 0; i < deck.cards.length; i++) review(actor, clock, true);
    expect(matches(actor, "done")).toBe(true);
    actor.send(backToHome.create());
    actor.send(openDeck.create({ deckId: "d1" }));
    expect(matches(actor, "done")).toBe(true);
    expect(actor.snapshot().context.session?.order).toEqual([]);
    expect(clock.hasPending()).toBe(false);
  });
});

describe("zigcards history and streaks through the machine", () => {
  it("grading twice on the same day merges a single history entry", () => {
    const { actor, clock } = makeApp(2);
    actor.send(openDeck.create({ deckId: "d1" }));
    review(actor, clock, true);
    review(actor, clock, true);
    expect(matches(actor, "done")).toBe(true);
    expect(actor.snapshot().context.history).toEqual([
      { day: dayKey(clock.now()), reviews: 2, known: 2, unknown: 0 },
    ]);
  });

  it("grading across midnight appends a second day entry", () => {
    const { actor, clock } = makeApp(1);
    runSession(actor, clock, true);
    expect(matches(actor, "done")).toBe(true);
    const day1 = dayKey(clock.now());
    actor.send(backToHome.create());
    clock.advance(DAY_MS);
    const day2 = dayKey(clock.now());
    expect(day2).not.toBe(day1);
    runSession(actor, clock, true);
    const history = actor.snapshot().context.history;
    expect(history).toHaveLength(2);
    expect(history[0]?.day).toBe(day1);
    expect(history[1]?.day).toBe(day2);
    expect(previousDay(day2)).toBe(day1);
  });

  it("consecutive daily sessions grow the current streak", () => {
    const { actor, clock } = makeApp(1);
    runSession(actor, clock, true);
    actor.send(backToHome.create());
    clock.advance(DAY_MS);
    runSession(actor, clock, true);
    const ctx = actor.snapshot().context;
    expect(ctx.history).toHaveLength(2);
    expect(currentStreak(ctx.history, dayKey(clock.now()))).toBe(2);
    expect(longestStreak(ctx.history)).toBe(2);
  });

  it("a gap day breaks the streak", () => {
    const { actor, clock } = makeApp(1);
    runSession(actor, clock, true);
    actor.send(backToHome.create());
    clock.advance(2 * DAY_MS);
    runSession(actor, clock, true);
    const ctx = actor.snapshot().context;
    expect(ctx.history).toHaveLength(2);
    expect(currentStreak(ctx.history, dayKey(clock.now()))).toBe(1);
    expect(longestStreak(ctx.history)).toBe(1);
  });
});
