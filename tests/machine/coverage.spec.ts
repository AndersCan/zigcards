import { describe, expect, it } from "vite-plus/test";
import { VirtualClock, type AnyActor } from "@mantaq/core";
import { createTestHarness } from "@mantaq/test";
import { GRADE_FLYOUT_MS, createAppActor } from "../../src/machine/machine.ts";
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

function makeApp(count = 3) {
  const deck = makeDeck("d1", count);
  const clock = new VirtualClock();
  const actor = createAppActor({ decks: { d1: deck }, clock, now: () => 1000 });
  return { actor, clock, deck };
}

/* Drives every state and every registered transition in the graph so the
   @mantaq/test harness can prove full coverage. Deliberate drops are wired as
   no-op handlers, so each of those fires a real (stay-put) transition. */
describe("machine graph coverage", () => {
  it("visits every state and transition", () => {
    const { actor, clock, deck } = makeApp(3);
    const h = createTestHarness(actor as unknown as AnyActor);
    const send = (type: string, payload?: unknown) => h.send({ type, payload });
    const advance = (ms: number) => clock.advance(ms);
    const walkDeck = () => {
      send("OPEN_DECK", { deckId: "d1" });
      for (let i = 0; i < deck.cards.length; i++) {
        send("FLIP");
        send("GRADE", { known: true });
        advance(GRADE_FLYOUT_MS);
      }
    };

    /* ---- home ---- */
    send("UPDATE_SETTINGS", { codeSize: 15 });
    send("RESET_PROGRESS");
    send("RESET");
    send("OPEN_CREDITS");
    send("UPDATE_SETTINGS", { printWidth: 60 });
    send("RESET");
    send("OPEN_CREDITS");
    send("BACK_TO_HOME");
    send("OPEN_SETTINGS");
    send("UPDATE_SETTINGS", { codeSize: 14 });
    send("CLOSE_SETTINGS"); // settingsFrom=home → home
    send("OPEN_SETTINGS");
    send("BACK_TO_HOME"); // settings → home
    send("OPEN_SETTINGS");
    send("RESET"); // settings → home

    /* ---- review.front ---- */
    send("OPEN_DECK", { deckId: "d1" });
    send("UPDATE_SETTINGS", { printWidth: 70 });
    send("GRADE", { known: true }); // no-op on the front
    send("OPEN_SETTINGS"); // review.front → settings
    send("CLOSE_SETTINGS"); // → review.front
    send("RESET"); // review.front → home
    send("OPEN_DECK", { deckId: "d1" });
    send("BACK_TO_HOME"); // review.front → home
    send("OPEN_DECK", { deckId: "d1" });
    send("FLIP"); // → review.back

    /* ---- review.back ---- */
    send("UPDATE_SETTINGS", { codeSize: 16 });
    send("FLIP"); // no-op
    send("OPEN_SETTINGS"); // review.back → settings
    send("CLOSE_SETTINGS"); // → review.back
    send("BACK_TO_HOME"); // review.back → home
    send("OPEN_DECK", { deckId: "d1" });
    send("FLIP");
    send("RESET"); // review.back → home
    send("OPEN_DECK", { deckId: "d1" });
    send("FLIP");
    send("GRADE", { known: true }); // → review.grading

    /* ---- review.grading ---- */
    send("UPDATE_SETTINGS", { printWidth: 55 });
    send("GRADE", { known: false }); // no-op during fly-out
    send("OPEN_SETTINGS"); // no-op during fly-out
    advance(GRADE_FLYOUT_MS); // gradeDone → review.front (card 2)
    send("FLIP");
    send("GRADE", { known: true }); // → review.grading (card 2)
    send("RESET"); // review.grading → home
    send("OPEN_DECK", { deckId: "d1" });
    send("FLIP");
    send("GRADE", { known: true }); // → review.grading
    send("BACK_TO_HOME"); // review.grading → home

    /* ---- done ---- */
    walkDeck(); // → done
    send("UPDATE_SETTINGS", { codeSize: 17 });
    send("RESET"); // done → home
    walkDeck(); // → done
    send("RESTART_DECK"); // done → review.front
    send("BACK_TO_HOME"); // review.front → home
    walkDeck(); // → done
    send("BACK_TO_HOME"); // done → home

    /* The instrument records only transitions that change state; internal
       events (GRADE_DONE) and self-transitions (RESET_PROGRESS on home) are
       unobservable, so assert every observable state-changing transition. */
    h.assertAllStatesVisited();
    const keyTransitions: ReadonlyArray<readonly [string, string]> = [
      ["home", "OPEN_DECK"],
      ["home", "OPEN_CREDITS"],
      ["home", "OPEN_SETTINGS"],
      ["review.front", "FLIP"],
      ["review.front", "OPEN_SETTINGS"],
      ["review.front", "BACK_TO_HOME"],
      ["review.front", "RESET"],
      ["review.back", "GRADE"],
      ["review.back", "OPEN_SETTINGS"],
      ["review.back", "BACK_TO_HOME"],
      ["review.back", "RESET"],
      ["review.grading", "BACK_TO_HOME"],
      ["review.grading", "RESET"],
      ["settings", "CLOSE_SETTINGS"],
      ["settings", "BACK_TO_HOME"],
      ["settings", "RESET"],
      ["done", "RESTART_DECK"],
      ["done", "BACK_TO_HOME"],
      ["done", "RESET"],
      ["credits", "BACK_TO_HOME"],
      ["credits", "RESET"],
    ];
    for (const [from, event] of keyTransitions) h.assertTransitionVisited(from, event);
    expect(clock.hasPending()).toBe(false);
  });
});
