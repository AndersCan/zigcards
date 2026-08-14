import { describe, expect, it } from "vite-plus/test";
import { VirtualClock } from "@mantaq/core";
import { matches } from "@mantaq/sugar";
import { DAY_MS } from "../../src/machine/context.ts";
import { GRADE_FLYOUT_MS, createAppActor } from "../../src/machine/machine.ts";
import {
  backToHome,
  closeSettings,
  drillMissed,
  flip,
  grade,
  openDeck,
  openDeckDetail,
  openSettings,
  openStats,
  reset,
  resetProgress,
  restartDeck,
  skip,
  updateSettings,
} from "../../src/machine/refs.ts";
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

function makeApp(count = 3, random?: () => number) {
  const deck = makeDeck("d1", count);
  const clock = new VirtualClock();
  const actor = createAppActor({ decks: { d1: deck }, clock, random });
  return { actor, clock, deck };
}

function orderedSession(deck: Deck): number[] {
  return deck.cards.map((_, i) => i);
}

describe("zigcards machine", () => {
  it("starts at home with no session, empty progress, and empty history", () => {
    const { actor } = makeApp();
    expect(matches(actor, "home")).toBe(true);
    const snap = actor.snapshot();
    expect(snap.context.session).toBeNull();
    expect(snap.context.progress).toEqual({});
    expect(snap.context.history).toEqual([]);
  });

  it("OPEN_DECK starts a fresh session over the due/new cards and enters review.front", () => {
    const { actor, deck } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    expect(matches(actor, "review.front")).toBe(true);
    const session = actor.snapshot().context.session;
    expect(session?.deckId).toBe("d1");
    expect(session?.idx).toBe(0);
    expect(session?.order).toEqual(orderedSession(deck));
    expect(session?.known).toBe(0);
    expect(session?.unknown).toBe(0);
    expect(session?.skipped).toBe(0);
    expect(session?.missed).toEqual([]);
  });

  it("OPEN_DECK with an unknown deck id is ignored", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "nope" }));
    expect(matches(actor, "home")).toBe(true);
    expect(actor.snapshot().context.session).toBeNull();
  });

  it("OPEN_DECK when nothing is due reaches done with an empty session", () => {
    const { actor, clock } = makeApp(1);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    expect(matches(actor, "done")).toBe(true);
    actor.send(backToHome.create());
    // the card is now due tomorrow, so a fresh pass has nothing due
    actor.send(openDeck.create({ deckId: "d1" }));
    expect(matches(actor, "done")).toBe(true);
    expect(actor.snapshot().context.session?.order).toEqual([]);
  });

  it("FLIP reveals the card and is dropped while already revealed", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    expect(matches(actor, "review.back")).toBe(true);
    actor.send(flip.create());
    expect(matches(actor, "review.back")).toBe(true);
  });

  it("GRADE on the front is dropped and records nothing", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(grade.create({ known: true }));
    expect(matches(actor, "review.front")).toBe(true);
    expect(actor.snapshot().context.stats.reviews).toBe(0);
  });

  it("GRADE records the review with a schedule and enters the grading fly-out", () => {
    const { actor, clock } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    clock.advance(500);
    actor.send(grade.create({ known: true }));
    expect(matches(actor, "review.grading")).toBe(true);
    const snap = actor.snapshot().context;
    expect(snap.session?.known).toBe(1);
    expect(snap.lastGrade).toEqual({ known: true });
    expect(snap.stats.reviews).toBe(1);
    const p = snap.progress["d1-0"];
    expect(p?.seen).toBe(1);
    expect(p?.known).toBe(1);
    expect(p?.unknown).toBe(0);
    expect(p?.state).toBe("review");
    expect(p?.interval).toBe(1);
    expect(p?.due).toBe(500 + DAY_MS);
    expect(p?.last).toBe(500);
    expect(p?.ease).toBeCloseTo(2.6);
    expect(snap.history[0]).toEqual({
      day: snap.history[0]!.day,
      reviews: 1,
      known: 1,
      unknown: 0,
    });
  });

  it("GRADE unknown schedules a relearning pass tomorrow", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: false }));
    const p = actor.snapshot().context.progress["d1-0"];
    expect(p?.state).toBe("relearning");
    expect(p?.interval).toBe(1);
    expect(p?.lapses).toBe(1);
    expect(p?.unknown).toBe(1);
    expect(p?.due).toBe(DAY_MS);
  });

  it("GRADE_DONE advances through the session order after the fly-out", () => {
    const { actor, clock } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(100);
    expect(matches(actor, "review.grading")).toBe(true);
    clock.advance(140);
    expect(matches(actor, "review.front")).toBe(true);
    expect(actor.snapshot().context.session?.idx).toBe(1);
    expect(actor.snapshot().context.lastGrade).toBeNull();
    expect(clock.hasPending()).toBe(false);
  });

  it("a second GRADE during the fly-out is dropped", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    actor.send(grade.create({ known: false }));
    expect(matches(actor, "review.grading")).toBe(true);
    expect(actor.snapshot().context.stats.reviews).toBe(1);
  });

  it("walks a whole deck and reaches done with one review per card", () => {
    const { actor, clock, deck } = makeApp(4);
    actor.send(openDeck.create({ deckId: "d1" }));
    for (const [i] of deck.cards.entries()) {
      actor.send(flip.create());
      actor.send(grade.create({ known: i % 2 === 0 }));
      clock.advance(GRADE_FLYOUT_MS);
    }
    expect(matches(actor, "done")).toBe(true);
    const snap = actor.snapshot().context;
    expect(snap.stats.reviews).toBe(deck.cards.length);
    expect(snap.session?.known).toBe(2);
    expect(snap.session?.unknown).toBe(2);
    expect(snap.session?.missed).toEqual(["d1-1", "d1-3"]);
    expect(clock.hasPending()).toBe(false);
  });

  it("RESTART_DECK re-runs the full deck with fresh counters", () => {
    const { actor, clock, deck } = makeApp(2);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    actor.send(flip.create());
    actor.send(grade.create({ known: false }));
    clock.advance(GRADE_FLYOUT_MS);
    expect(matches(actor, "done")).toBe(true);
    const before = actor.snapshot().context.stats.sessions;
    actor.send(restartDeck.create());
    expect(matches(actor, "review.front")).toBe(true);
    const session = actor.snapshot().context.session;
    expect(session?.order).toEqual(orderedSession(deck));
    expect(session?.idx).toBe(0);
    expect(session?.known).toBe(0);
    expect(session?.unknown).toBe(0);
    expect(actor.snapshot().context.stats.sessions).toBe(before + 1);
  });

  it("DRILL_MISSED re-quizzes only the unknown cards", () => {
    const { actor, clock } = makeApp(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    actor.send(flip.create());
    actor.send(grade.create({ known: false }));
    clock.advance(GRADE_FLYOUT_MS);
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    expect(matches(actor, "done")).toBe(true);
    actor.send(drillMissed.create());
    expect(matches(actor, "review.front")).toBe(true);
    const session = actor.snapshot().context.session;
    expect(session?.order).toEqual([1]);
    expect(session?.idx).toBe(0);
    expect(session?.missed).toEqual([]);
  });

  it("DRILL_MISSED is a no-op when nothing was missed", () => {
    const { actor, clock, deck } = makeApp(2);
    actor.send(openDeck.create({ deckId: "d1" }));
    for (let i = 0; i < deck.cards.length; i++) {
      actor.send(flip.create());
      actor.send(grade.create({ known: true }));
      clock.advance(GRADE_FLYOUT_MS);
    }
    expect(matches(actor, "done")).toBe(true);
    actor.send(drillMissed.create());
    expect(matches(actor, "done")).toBe(true);
  });

  it("SKIP re-queues the card at the end and does not grade it", () => {
    const { actor, clock, deck } = makeApp(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(skip.create());
    expect(matches(actor, "review.front")).toBe(true);
    const session = actor.snapshot().context.session;
    expect(session?.order).toEqual([1, 2, 0]);
    expect(session?.idx).toBe(0);
    expect(session?.skipped).toBe(1);
    expect(actor.snapshot().context.stats.reviews).toBe(0);
    // walk the rest and confirm the skipped card still gets graded
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    expect(matches(actor, "done")).toBe(true);
    expect(actor.snapshot().context.progress["d1-0"]?.seen).toBe(1);
    expect(actor.snapshot().context.stats.reviews).toBe(deck.cards.length);
  });

  it("SKIP on the last card finishes the session", () => {
    const { actor } = makeApp(1);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(skip.create());
    expect(matches(actor, "done")).toBe(true);
    expect(actor.snapshot().context.session?.skipped).toBe(1);
    expect(actor.snapshot().context.stats.reviews).toBe(0);
  });

  it("SKIP from the back returns to the next card's front without grading it", () => {
    const { actor, clock } = makeApp(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    expect(matches(actor, "review.back")).toBe(true);
    actor.send(skip.create());
    expect(matches(actor, "review.front")).toBe(true);
    const session = actor.snapshot().context.session;
    expect(session?.order).toEqual([1, 2, 0]);
    expect(session?.idx).toBe(0);
    expect(session?.skipped).toBe(1);
    expect(actor.snapshot().context.stats.reviews).toBe(0);
    // the next card up is card 1; grading it leaves the skipped card untouched
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    expect(actor.snapshot().context.progress["d1-1"]?.known).toBe(1);
    expect(actor.snapshot().context.progress["d1-0"]).toBeUndefined();
  });

  it("SKIP at the last position of a multi-card session finishes it", () => {
    const { actor, clock } = makeApp(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    expect(actor.snapshot().context.session?.idx).toBe(2);
    actor.send(skip.create());
    expect(matches(actor, "done")).toBe(true);
    expect(actor.snapshot().context.session?.skipped).toBe(1);
    expect(actor.snapshot().context.stats.reviews).toBe(2);
    expect(clock.hasPending()).toBe(false);
  });

  it("SKIP on every card eventually terminates the session without grading", () => {
    const { actor } = makeApp(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    // each card gets re-queued once...
    for (let i = 0; i < 3; i++) actor.send(skip.create());
    expect(matches(actor, "review.front")).toBe(true);
    // ...then a second skip on each passes it, and the session ends
    for (let i = 0; i < 3; i++) actor.send(skip.create());
    expect(matches(actor, "done")).toBe(true);
    expect(actor.snapshot().context.session?.skipped).toBe(6);
    expect(actor.snapshot().context.stats.reviews).toBe(0);
  });

  it("shuffled sessions preserve the card set in a different order", () => {
    const { actor, deck } = makeApp(4, () => 0.4);
    actor.send(updateSettings.create({ shuffle: true }));
    actor.send(openDeck.create({ deckId: "d1" }));
    const order = actor.snapshot().context.session?.order;
    expect([...(order ?? [])].sort((a, b) => a - b)).toEqual(orderedSession(deck));
    expect(order).not.toEqual(orderedSession(deck));
  });

  it("shuffle is deterministic for the same injected random source", () => {
    const random = () => 0.4;
    const a = makeApp(5, random);
    const b = makeApp(5, random);
    for (const app of [a, b]) {
      app.actor.send(updateSettings.create({ shuffle: true }));
      app.actor.send(openDeck.create({ deckId: "d1" }));
    }
    const orderA = a.actor.snapshot().context.session?.order;
    const orderB = b.actor.snapshot().context.session?.order;
    expect(orderA).toEqual(orderB);
    expect([...(orderA ?? [])].sort((x, y) => x - y)).toEqual(orderedSession(a.deck));
    expect(orderA).not.toEqual(orderedSession(a.deck));
  });

  it("with shuffle off the order stays [0,1,2,...] even with a random injected", () => {
    const { actor, deck } = makeApp(4, () => 0.4);
    actor.send(openDeck.create({ deckId: "d1" }));
    expect(actor.snapshot().context.session?.order).toEqual(orderedSession(deck));
  });

  it("RESTART_DECK and DRILL_MISSED shuffle when the setting is on", () => {
    const { actor, clock, deck } = makeApp(4, () => 0.4);
    actor.send(updateSettings.create({ shuffle: true }));
    actor.send(openDeck.create({ deckId: "d1" }));
    const first = actor.snapshot().context.session?.order ?? [];
    for (const cardIdx of first) {
      const card = deck.cards[cardIdx]!;
      actor.send(flip.create());
      actor.send(grade.create({ known: card.id !== "d1-1" && card.id !== "d1-3" }));
      clock.advance(GRADE_FLYOUT_MS);
    }
    expect(matches(actor, "done")).toBe(true);
    const missed = actor.snapshot().context.session?.missed ?? [];
    expect([...missed].sort()).toEqual(["d1-1", "d1-3"]);
    actor.send(drillMissed.create());
    const drill = actor.snapshot().context.session?.order;
    expect([...(drill ?? [])].sort((x, y) => x - y)).toEqual([1, 3]);
    expect(drill).not.toEqual([1, 3]);
    for (let i = 0; i < (drill ?? []).length; i++) {
      actor.send(flip.create());
      actor.send(grade.create({ known: true }));
      clock.advance(GRADE_FLYOUT_MS);
    }
    expect(matches(actor, "done")).toBe(true);
    actor.send(restartDeck.create());
    const restarted = actor.snapshot().context.session?.order;
    expect([...(restarted ?? [])].sort((x, y) => x - y)).toEqual(orderedSession(deck));
    expect(restarted).not.toEqual(orderedSession(deck));
    expect(clock.hasPending()).toBe(false);
  });

  it("BACK_TO_HOME mid-review pauses the session for later resume", () => {
    const { actor, clock } = makeApp(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    expect(actor.snapshot().context.session?.idx).toBe(1);
    actor.send(backToHome.create());
    expect(matches(actor, "home")).toBe(true);
    // session survives, aborts the fly-out timer
    expect(actor.snapshot().context.session).not.toBeNull();
    expect(actor.snapshot().context.session?.idx).toBe(1);
    clock.advance(1000);
    expect(clock.hasPending()).toBe(false);
    // reopening the deck resumes, not restarts
    const sessions = actor.snapshot().context.stats.sessions;
    actor.send(openDeck.create({ deckId: "d1" }));
    expect(matches(actor, "review.front")).toBe(true);
    expect(actor.snapshot().context.session?.idx).toBe(1);
    expect(actor.snapshot().context.session?.known).toBe(1);
    expect(actor.snapshot().context.stats.sessions).toBe(sessions);
  });

  it("BACK_TO_HOME from done clears the session", () => {
    const { actor, clock } = makeApp(1);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    expect(matches(actor, "done")).toBe(true);
    actor.send(backToHome.create());
    expect(matches(actor, "home")).toBe(true);
    expect(actor.snapshot().context.session).toBeNull();
  });

  it("reopening a completed deck after the interval bumps sessions and starts fresh", () => {
    const { actor, clock, deck } = makeApp(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    for (let i = 0; i < deck.cards.length; i++) {
      actor.send(flip.create());
      actor.send(grade.create({ known: true }));
      clock.advance(GRADE_FLYOUT_MS);
    }
    expect(matches(actor, "done")).toBe(true);
    expect(actor.snapshot().context.stats.sessions).toBe(1);
    actor.send(backToHome.create());
    expect(actor.snapshot().context.session).toBeNull();
    // everything is scheduled in the future: a fresh pass reaches done with no queue
    actor.send(openDeck.create({ deckId: "d1" }));
    expect(matches(actor, "done")).toBe(true);
    expect(actor.snapshot().context.session?.order).toEqual([]);
    actor.send(backToHome.create());
    clock.advance(DAY_MS + 1);
    const sessions = actor.snapshot().context.stats.sessions;
    actor.send(openDeck.create({ deckId: "d1" }));
    expect(matches(actor, "review.front")).toBe(true);
    const session = actor.snapshot().context.session;
    expect(session?.order).toEqual(orderedSession(deck));
    expect(session?.idx).toBe(0);
    expect(session?.known).toBe(0);
    expect(session?.unknown).toBe(0);
    expect(session?.skipped).toBe(0);
    expect(actor.snapshot().context.stats.sessions).toBe(sessions + 1);
    for (const card of deck.cards) {
      expect(actor.snapshot().context.progress[card.id]?.interval).toBe(1);
    }
    expect(clock.hasPending()).toBe(false);
  });

  it("RESET_PROGRESS clears progress, stats, and history and stays home", () => {
    const { actor, clock } = makeApp(1);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    actor.send(backToHome.create());
    expect(actor.snapshot().context.stats.reviews).toBe(1);
    actor.send(resetProgress.create());
    expect(matches(actor, "home")).toBe(true);
    expect(actor.snapshot().context.progress).toEqual({});
    expect(actor.snapshot().context.history).toEqual([]);
    expect(actor.snapshot().context.stats.reviews).toBe(0);
  });

  it("RESET returns to a clean home from any state and wipes everything", () => {
    const { actor, clock } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    actor.send(reset.create());
    expect(matches(actor, "home")).toBe(true);
    const snap = actor.snapshot().context;
    expect(snap.session).toBeNull();
    expect(snap.progress).toEqual({});
    expect(snap.history).toEqual([]);
    expect(snap.stats.reviews).toBe(0);
    clock.advance(1000);
    expect(matches(actor, "home")).toBe(true);
    expect(clock.hasPending()).toBe(false);
  });

  it("a throwing handler routes into the __error state and drops further sends", () => {
    const clock = new VirtualClock();
    // cards is deliberately corrupted so the grade transition throws
    const badDeck = { ...makeDeck("d1", 2), cards: null } as unknown as Deck;
    const actor = createAppActor({ decks: { d1: badDeck }, clock });
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    const snap = actor.snapshot();
    expect(snap.path).toEqual(["__error"]);
    expect(snap.error?.reason).toBe("transition");
    expect(snap.error?.error).toBeInstanceOf(TypeError);
    // fail-stop: further sends are ignored, effects stay aborted
    actor.send(backToHome.create());
    expect(actor.snapshot().path).toEqual(["__error"]);
    clock.advance(GRADE_FLYOUT_MS * 2);
    expect(actor.snapshot().path).toEqual(["__error"]);
    expect(clock.hasPending()).toBe(false);
  });

  it("the snapshot carries the full app context", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    const snap = actor.snapshot();
    expect(snap.path).toEqual(["review.back"]);
    expect(snap.context.session?.deckId).toBe("d1");
    expect(snap.done).toBeUndefined();
  });

  it("OPEN_SETTINGS from home enters settings and CLOSE returns home", () => {
    const { actor } = makeApp();
    actor.send(openSettings.create());
    expect(matches(actor, "settings")).toBe(true);
    actor.send(closeSettings.create());
    expect(matches(actor, "home")).toBe(true);
  });

  it("OPEN_SETTINGS mid-review returns to the same card side", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(openSettings.create());
    expect(matches(actor, "settings")).toBe(true);
    actor.send(closeSettings.create());
    expect(matches(actor, "review.back")).toBe(true);
    expect(actor.snapshot().context.session?.idx).toBe(0);
  });

  it("UPDATE_SETTINGS mutates context without leaving the state", () => {
    const { actor } = makeApp();
    actor.send(openSettings.create());
    actor.send(updateSettings.create({ codeSize: 15 }));
    expect(matches(actor, "settings")).toBe(true);
    expect(actor.snapshot().context.settings).toEqual({
      codeSize: 15,
      printWidth: null,
      shuffle: false,
    });
  });

  it("UPDATE_SETTINGS toggles shuffle from a review state too", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(updateSettings.create({ shuffle: true }));
    expect(matches(actor, "review.back")).toBe(true);
    expect(actor.snapshot().context.settings.shuffle).toBe(true);
  });

  it("OPEN_DECK_DETAIL enters deck.detail and OPEN_DECK starts a session from it", () => {
    const { actor } = makeApp();
    actor.send(openDeckDetail.create({ deckId: "d1" }));
    expect(matches(actor, "deck.detail")).toBe(true);
    expect(actor.snapshot().context.detailDeckId).toBe("d1");
    actor.send(backToHome.create());
    expect(matches(actor, "home")).toBe(true);
    expect(actor.snapshot().context.detailDeckId).toBeNull();
  });

  it("OPEN_DECK from deck.detail resumes a paused session for the same deck", () => {
    const { actor, clock } = makeApp(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    expect(actor.snapshot().context.session?.idx).toBe(1);
    actor.send(backToHome.create());
    const sessions = actor.snapshot().context.stats.sessions;
    actor.send(openDeckDetail.create({ deckId: "d1" }));
    expect(matches(actor, "deck.detail")).toBe(true);
    actor.send(openDeck.create({ deckId: "d1" }));
    expect(matches(actor, "review.front")).toBe(true);
    const session = actor.snapshot().context.session;
    expect(session?.idx).toBe(1);
    expect(session?.known).toBe(1);
    expect(session?.order).toEqual([0, 1, 2]);
    expect(actor.snapshot().context.stats.sessions).toBe(sessions);
    expect(clock.hasPending()).toBe(false);
  });

  it("OPEN_DECK_DETAIL for an unknown deck is ignored", () => {
    const { actor } = makeApp();
    actor.send(openDeckDetail.create({ deckId: "nope" }));
    expect(matches(actor, "home")).toBe(true);
  });

  it("OPEN_STATS enters stats and BACK_TO_HOME returns", () => {
    const { actor } = makeApp();
    actor.send(openStats.create());
    expect(matches(actor, "stats")).toBe(true);
    actor.send(backToHome.create());
    expect(matches(actor, "home")).toBe(true);
  });

  it("RESET keeps the code settings", () => {
    const { actor } = makeApp();
    actor.send(openSettings.create());
    actor.send(updateSettings.create({ codeSize: 15 }));
    actor.send(closeSettings.create());
    actor.send(reset.create());
    expect(actor.snapshot().context.settings.codeSize).toBe(15);
  });
});
