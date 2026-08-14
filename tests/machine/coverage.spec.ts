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
  const actor = createAppActor({ decks: { d1: deck }, clock });
  return { actor, clock, deck };
}

/* Drives every state and every registered transition in the graph so the
   @mantaq/test harness can prove full coverage. Deliberate drops are wired as
   no-op handlers, so each of those fires a real (stay-put) transition. */
describe("machine graph coverage", () => {
  it("visits every state and transition", () => {
    const { actor, clock } = makeApp(3);
    const h = createTestHarness(actor as unknown as AnyActor);
    const send = (type: string, payload?: unknown) => h.send({ type, payload });
    const advance = (ms: number) => clock.advance(ms);
    const walk = (grades: boolean[]) => {
      for (const known of grades) {
        send("FLIP");
        send("GRADE", { known });
        advance(GRADE_FLYOUT_MS);
      }
    };

    /* ---- home, credits, stats, deck.detail ---- */
    send("UPDATE_SETTINGS", { codeSize: 15 });
    send("RESET_PROGRESS");
    send("RESET");
    send("OPEN_CREDITS"); // home → credits
    send("BACK_TO_HOME"); // credits → home
    send("OPEN_CREDITS");
    send("RESET"); // credits → home
    send("OPEN_STATS"); // home → stats
    send("OPEN_SETTINGS"); // stats → settings
    send("CLOSE_SETTINGS"); // → stats
    send("BACK_TO_HOME"); // stats → home
    send("OPEN_STATS");
    send("RESET"); // stats → home
    send("OPEN_DECK_DETAIL", { deckId: "d1" }); // home → deck.detail
    send("OPEN_SETTINGS"); // deck.detail → settings
    send("CLOSE_SETTINGS"); // → deck.detail
    send("OPEN_DECK", { deckId: "d1" }); // deck.detail → review.front
    send("RESET");
    send("OPEN_DECK_DETAIL", { deckId: "d1" });
    send("BACK_TO_HOME"); // deck.detail → home
    send("OPEN_DECK_DETAIL", { deckId: "d1" });
    send("RESET"); // deck.detail → home
    send("OPEN_SETTINGS"); // home → settings
    send("UPDATE_SETTINGS", { codeSize: 14 });
    send("CLOSE_SETTINGS"); // settings → home
    send("OPEN_SETTINGS");
    send("BACK_TO_HOME"); // settings → home
    send("OPEN_SETTINGS");
    send("RESET"); // settings → home

    /* ---- review.front ---- */
    send("OPEN_DECK", { deckId: "d1" });
    send("UPDATE_SETTINGS", { printWidth: 70 });
    send("GRADE", { known: true }); // dropped on the front
    send("SKIP"); // re-queues, stays on the front
    send("OPEN_SETTINGS"); // review.front → settings
    send("CLOSE_SETTINGS"); // → review.front
    send("BACK_TO_HOME"); // review.front → home (paused)
    send("RESET"); // clears the paused session
    send("OPEN_DECK", { deckId: "d1" });
    send("FLIP"); // → review.back

    /* ---- review.back ---- */
    send("FLIP"); // dropped while revealed
    send("OPEN_SETTINGS"); // review.back → settings
    send("CLOSE_SETTINGS"); // → review.back
    send("BACK_TO_HOME"); // review.back → home (paused)
    send("RESET"); // clears the paused session
    send("OPEN_DECK", { deckId: "d1" });
    send("FLIP");
    send("SKIP"); // re-queues, back to the front
    send("RESET"); // review.front → home
    send("OPEN_DECK", { deckId: "d1" });
    send("FLIP");
    send("RESET"); // review.back → home
    send("OPEN_DECK", { deckId: "d1" });
    send("FLIP");
    send("GRADE", { known: true }); // → review.grading

    /* ---- review.grading ---- */
    send("UPDATE_SETTINGS", { codeSize: 16 });
    send("GRADE", { known: false }); // dropped during the fly-out
    send("OPEN_SETTINGS"); // dropped during the fly-out
    send("BACK_TO_HOME"); // review.grading → home (paused)
    send("RESET");
    send("OPEN_DECK", { deckId: "d1" });
    send("FLIP");
    send("GRADE", { known: true });
    send("RESET"); // review.grading → home
    send("OPEN_DECK", { deckId: "d1" });
    send("FLIP");
    send("GRADE", { known: true });
    advance(GRADE_FLYOUT_MS); // → review.front (card 2)
    send("FLIP");
    send("GRADE", { known: false }); // missed
    advance(GRADE_FLYOUT_MS); // → review.front (card 3)
    send("FLIP");
    send("GRADE", { known: true });
    advance(GRADE_FLYOUT_MS); // → done

    /* ---- done: drill missed, restart, skip-to-done ---- */
    send("UPDATE_SETTINGS", { codeSize: 17 });
    send("DRILL_MISSED"); // done → review.front (only the missed card)
    walk([true]); // → done
    send("BACK_TO_HOME"); // done → home (session cleared)
    send("OPEN_DECK", { deckId: "d1" }); // nothing due → home → done
    send("RESET");
    send("OPEN_DECK", { deckId: "d1" });
    walk([true, true, true]); // → done
    send("RESTART_DECK"); // done → review.front (full pass)
    walk([true, true, true]); // → done
    send("RESET");
    send("OPEN_DECK", { deckId: "d1" });
    send("FLIP");
    send("GRADE", { known: true });
    advance(GRADE_FLYOUT_MS);
    send("FLIP");
    send("GRADE", { known: true });
    advance(GRADE_FLYOUT_MS);
    send("SKIP"); // last card skipped from the front → done
    send("RESET");
    send("OPEN_DECK", { deckId: "d1" });
    send("FLIP");
    send("GRADE", { known: true });
    advance(GRADE_FLYOUT_MS);
    send("FLIP");
    send("GRADE", { known: true });
    advance(GRADE_FLYOUT_MS);
    send("FLIP"); // review.back of the last card
    send("SKIP"); // → done
    send("RESET"); // done → home

    /* The instrument records only transitions that change state; internal
       events (GRADE_DONE) and self-transitions (RESET_PROGRESS on home) are
       unobservable, so assert every observable state-changing transition. */
    h.assertAllStatesVisited();
    const keyTransitions: ReadonlyArray<readonly [string, string]> = [
      ["home", "OPEN_DECK"],
      ["home", "OPEN_DECK_DETAIL"],
      ["home", "OPEN_STATS"],
      ["home", "OPEN_SETTINGS"],
      ["home", "OPEN_CREDITS"],
      ["deck.detail", "OPEN_DECK"],
      ["deck.detail", "OPEN_SETTINGS"],
      ["deck.detail", "BACK_TO_HOME"],
      ["deck.detail", "RESET"],
      ["stats", "OPEN_SETTINGS"],
      ["stats", "BACK_TO_HOME"],
      ["stats", "RESET"],
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
      ["done", "RESTART_DECK"],
      ["done", "DRILL_MISSED"],
      ["done", "BACK_TO_HOME"],
      ["done", "RESET"],
      ["settings", "CLOSE_SETTINGS"],
      ["settings", "BACK_TO_HOME"],
      ["settings", "RESET"],
      ["credits", "BACK_TO_HOME"],
      ["credits", "RESET"],
      ["review.front", "SKIP"],
      ["review.back", "SKIP"],
    ];
    for (const [from, event] of keyTransitions) h.assertTransitionVisited(from, event);
    expect(clock.hasPending()).toBe(false);
  });
});
