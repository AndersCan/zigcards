import { describe, expect, it } from "vite-plus/test";
import { VirtualClock } from "@mantaq/core";
import { matches } from "@mantaq/sugar";
import { GRADE_FLYOUT_MS, createAppActor } from "../../src/machine/machine.ts";
import {
  backToHome,
  flip,
  grade,
  openDeck,
  pointerDown,
  pointerMove,
  pointerUp,
  reset,
  resetProgress,
  restartDeck,
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
  return { id, title: id, order: 1, blurb: "test deck", cards };
}

function makeApp(count = 3) {
  const deck = makeDeck("d1", count);
  const clock = new VirtualClock();
  const actor = createAppActor({ decks: { d1: deck }, clock });
  return { actor, clock, deck };
}

describe("zigcards machine", () => {
  it("starts at home with no session and empty progress", () => {
    const { actor } = makeApp();
    expect(matches(actor, "home")).toBe(true);
    const snap = actor.snapshot();
    expect(snap.context.session).toBeNull();
    expect(snap.context.progress).toEqual({});
  });

  it("OPEN_DECK starts a fresh session and enters review.front", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    expect(matches(actor, "review.front")).toBe(true);
    expect(actor.snapshot().context.session).toEqual({
      deckId: "d1",
      idx: 0,
      known: 0,
      unknown: 0,
    });
  });

  it("OPEN_DECK with an unknown deck id is ignored", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "nope" }));
    expect(matches(actor, "home")).toBe(true);
    expect(actor.snapshot().context.session).toBeNull();
  });

  it("FLIP reveals the card", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    expect(matches(actor, "review.back")).toBe(true);
  });

  it("FLIP is dropped while already revealed", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
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

  it("GRADE records the review and enters the grading fly-out", () => {
    const { actor } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    expect(matches(actor, "review.grading")).toBe(true);
    const snap = actor.snapshot().context;
    expect(snap.session).toEqual({ deckId: "d1", idx: 0, known: 1, unknown: 0 });
    expect(snap.lastGrade).toEqual({ known: true });
    expect(snap.stats.reviews).toBe(1);
    expect(snap.progress["d1-0"]).toMatchObject({ seen: 1, known: 1, unknown: 0 });
  });

  it("GRADE_DONE advances to the next card after the fly-out", () => {
    const { actor, clock } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(100);
    expect(matches(actor, "review.grading")).toBe(true);
    clock.advance(140);
    expect(matches(actor, "review.front")).toBe(true);
    expect(actor.snapshot().context.session?.idx).toBe(1);
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
  });

  it("RESTART_DECK from done reuses the deck with fresh counters", () => {
    const { actor, clock } = makeApp(2);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    actor.send(flip.create());
    actor.send(grade.create({ known: false }));
    clock.advance(GRADE_FLYOUT_MS);
    expect(matches(actor, "done")).toBe(true);
    actor.send(restartDeck.create());
    expect(matches(actor, "review.front")).toBe(true);
    expect(actor.snapshot().context.session).toEqual({
      deckId: "d1",
      idx: 0,
      known: 0,
      unknown: 0,
    });
  });

  it("BACK_TO_HOME aborts the fly-out timer and clears the session", () => {
    const { actor, clock } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    actor.send(backToHome.create());
    expect(matches(actor, "home")).toBe(true);
    clock.advance(1000);
    expect(matches(actor, "home")).toBe(true);
    expect(actor.snapshot().context.session).toBeNull();
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

  it("RESET_PROGRESS clears progress and stays home", () => {
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
    expect(actor.snapshot().context.stats.reviews).toBe(0);
  });

  it("RESET returns to a clean home from any state and wipes progress", () => {
    const { actor, clock } = makeApp();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    actor.send(reset.create());
    expect(matches(actor, "home")).toBe(true);
    const snap = actor.snapshot().context;
    expect(snap.session).toBeNull();
    expect(snap.progress).toEqual({});
    expect(snap.stats.reviews).toBe(0);
    clock.advance(1000);
    expect(matches(actor, "home")).toBe(true);
  });

  it("change fires on context-only mutations", () => {
    const { actor } = makeApp();
    let changes = 0;
    actor.on("change", () => (changes += 1));
    actor.send(resetProgress.create());
    expect(changes).toBe(2);
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

  describe("pointer / swipe", () => {
    it("tracks a drag in context and clears it on release", () => {
      const { actor } = makeApp();
      actor.send(openDeck.create({ deckId: "d1" }));
      actor.send(flip.create());
      actor.send(pointerDown.create({ x: 100, y: 200 }));
      expect(actor.snapshot().context.drag).toEqual({ x: 100, y: 200, dx: 0 });
      actor.send(pointerMove.create({ x: 130 }));
      expect(actor.snapshot().context.drag?.dx).toBe(30);
      actor.send(pointerUp.create());
      expect(actor.snapshot().context.drag).toBeNull();
      expect(matches(actor, "review.back")).toBe(true);
    });

    it("a swipe past the threshold grades the card to the right", () => {
      const { actor, clock } = makeApp();
      actor.send(openDeck.create({ deckId: "d1" }));
      actor.send(flip.create());
      actor.send(pointerDown.create({ x: 100, y: 200 }));
      actor.send(pointerMove.create({ x: 220 }));
      actor.send(pointerUp.create());
      expect(matches(actor, "review.grading")).toBe(true);
      expect(actor.snapshot().context.stats.reviews).toBe(1);
      expect(actor.snapshot().context.session?.known).toBe(1);
      clock.advance(GRADE_FLYOUT_MS);
      expect(matches(actor, "review.front")).toBe(true);
    });

    it("a swipe to the left grades as unknown", () => {
      const { actor } = makeApp();
      actor.send(openDeck.create({ deckId: "d1" }));
      actor.send(flip.create());
      actor.send(pointerDown.create({ x: 300, y: 200 }));
      actor.send(pointerMove.create({ x: 120 }));
      actor.send(pointerUp.create());
      expect(matches(actor, "review.grading")).toBe(true);
      expect(actor.snapshot().context.session?.unknown).toBe(1);
    });

    it("a short swipe does not grade", () => {
      const { actor } = makeApp();
      actor.send(openDeck.create({ deckId: "d1" }));
      actor.send(flip.create());
      actor.send(pointerDown.create({ x: 100, y: 200 }));
      actor.send(pointerMove.create({ x: 130 }));
      actor.send(pointerUp.create());
      expect(matches(actor, "review.back")).toBe(true);
      expect(actor.snapshot().context.stats.reviews).toBe(0);
    });
  });
});
