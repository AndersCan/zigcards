import { describe, expect, it } from "vite-plus/test";
import { VirtualClock } from "@mantaq/core";
import { DAY_MS } from "../../src/machine/context.ts";
import { GRADE_FLYOUT_MS, createAppActor } from "../../src/machine/machine.ts";
import {
  attachPersistence,
  loadPersisted,
  persistData,
  STORAGE_KEY,
  type PersistedData,
  type StorageLike,
} from "../../src/machine/persistence.ts";
import {
  backToHome,
  flip,
  grade,
  openDeck,
  reset,
  resetProgress,
  skip,
  updateSettings,
} from "../../src/machine/refs.ts";
import type { Card, Deck } from "../../src/types.ts";

function memoryStorage(): StorageLike & { data: Map<string, string>; writes: () => number } {
  const data = new Map<string, string>();
  let writes = 0;
  return {
    data,
    writes: () => writes,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
      writes += 1;
    },
  };
}

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

function boot(count = 3) {
  const deck = makeDeck("d1", count);
  const storage = memoryStorage();
  const clock = new VirtualClock();
  const actor = createAppActor({ decks: { d1: deck }, clock });
  attachPersistence(actor, storage);
  return { actor, clock, storage, deck };
}

function storedData(storage: StorageLike & { data: Map<string, string> }): PersistedData {
  return JSON.parse(storage.data.get(STORAGE_KEY) ?? "{}") as PersistedData;
}

function v2Empty(): PersistedData {
  return {
    version: 2,
    cards: {},
    stats: { sessions: 0, reviews: 0, known: 0, unknown: 0 },
    history: [],
    settings: { codeSize: null, printWidth: null, shuffle: false },
    session: null,
  };
}

describe("persistence", () => {
  it("round-trips v2 persisted data", () => {
    const storage = memoryStorage();
    const data: PersistedData = {
      version: 2,
      cards: {
        a: {
          seen: 2,
          known: 1,
          unknown: 1,
          last: 5,
          state: "relearning",
          due: 5 + DAY_MS,
          interval: 1,
          ease: 2.4,
          reps: 0,
          lapses: 1,
        },
      },
      stats: { sessions: 1, reviews: 2, known: 1, unknown: 1 },
      history: [{ day: "2026-08-01", reviews: 2, known: 1, unknown: 1 }],
      settings: { codeSize: 15, printWidth: 70, shuffle: true },
      session: {
        deckId: "d1",
        order: [0, 1],
        idx: 1,
        known: 1,
        unknown: 0,
        skipped: 0,
        skippedCards: [],
        missed: [],
      },
    };
    persistData(data, storage);
    expect(loadPersisted(storage)).toEqual(data);
  });

  it("returns null when nothing is stored", () => {
    expect(loadPersisted(memoryStorage())).toBeNull();
  });

  it("returns null on malformed json", () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, "{nope");
    expect(loadPersisted(storage)).toBeNull();
  });

  it("hydrates defaults for missing keys (v1 data shape)", () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ stats: { reviews: 4 } }));
    expect(loadPersisted(storage)).toEqual({
      ...v2Empty(),
      stats: { sessions: 0, reviews: 4, known: 0, unknown: 0 },
    });
  });

  it("validates and clamps persisted data", () => {
    const storage = memoryStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        stats: { reviews: "oops" },
        cards: {
          a: { seen: -3, known: 1, unknown: 0, last: "x", state: "bogus", ease: 99 },
        },
        settings: { codeSize: 999, printWidth: 5, shuffle: "yes" },
        session: { deckId: "d1", order: [0, "x"], idx: 50, missed: [1] },
      }),
    );
    const loaded = loadPersisted(storage);
    expect(loaded?.cards.a).toEqual({
      seen: 0,
      known: 1,
      unknown: 0,
      last: 0,
      state: "new",
      due: 0,
      interval: 0,
      ease: 3.0,
      reps: 0,
      lapses: 0,
    });
    expect(loaded?.stats).toEqual({ sessions: 0, reviews: 0, known: 0, unknown: 0 });
    expect(loaded?.settings).toEqual({ codeSize: 20, printWidth: 40, shuffle: false });
    expect(loaded?.session).toEqual({
      deckId: "d1",
      order: [0],
      idx: 0,
      known: 0,
      unknown: 0,
      skipped: 0,
      skippedCards: [],
      missed: [],
    });
  });

  it("migrates v1 cards into a due-now schedule", () => {
    const storage = memoryStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cards: { a: { seen: 3, known: 2, unknown: 1, last: 500 } },
        stats: { sessions: 0, reviews: 3, known: 2, unknown: 1 },
      }),
    );
    const loaded = loadPersisted(storage);
    expect(loaded?.cards.a).toEqual({
      seen: 3,
      known: 2,
      unknown: 1,
      last: 500,
      state: "review",
      due: 500,
      interval: 0,
      ease: 2.5,
      reps: 0,
      lapses: 0,
    });
    expect(loaded?.history).toEqual([]);
    expect(loaded?.session).toBeNull();
  });

  it("persists settings changes including shuffle", () => {
    const { actor, storage } = boot();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    // opening a session is persisted so it can be resumed
    expect(storage.writes()).toBe(1);
    actor.send(updateSettings.create({ codeSize: 16, printWidth: 60, shuffle: true }));
    expect(storedData(storage).settings).toEqual({ codeSize: 16, printWidth: 60, shuffle: true });
  });

  it("writes only when persisted data changes", () => {
    const { actor, storage } = boot();
    actor.send(openDeck.create({ deckId: "d1" }));
    expect(storage.writes()).toBe(1);
    actor.send(flip.create());
    expect(storage.writes()).toBe(1); // revealing a card changes nothing persisted
    actor.send(grade.create({ known: true }));
    expect(storedData(storage).stats.reviews).toBe(1);
    expect(storage.writes()).toBe(2);
  });

  it("persists the resume position as the session advances", () => {
    const { actor, clock, storage, deck } = boot(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    clock.advance(GRADE_FLYOUT_MS);
    expect(storedData(storage).session?.idx).toBe(1);
    expect(storedData(storage).session?.order).toEqual(deck.cards.map((_, i) => i));
  });

  it("SKIP persists the rotated order and the skipped counter", () => {
    const { actor, clock, storage } = boot(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(skip.create());
    const stored = storedData(storage);
    expect(stored.session?.order).toEqual([1, 2, 0]);
    expect(stored.session?.idx).toBe(0);
    expect(stored.session?.skipped).toBe(1);
    expect(stored.session?.skippedCards).toEqual(["d1-0"]);
    expect(stored.session?.known).toBe(0);
    expect(stored.session?.unknown).toBe(0);
    expect(clock.hasPending()).toBe(false);
  });

  it("persists the full review tally and schedule", () => {
    const { actor, clock, storage, deck } = boot(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    for (const [i] of deck.cards.entries()) {
      actor.send(flip.create());
      actor.send(grade.create({ known: i % 2 === 0 }));
      clock.advance(GRADE_FLYOUT_MS);
    }
    const stored = storedData(storage);
    expect(stored.stats.reviews).toBe(deck.cards.length);
    expect(stored.cards["d1-0"]?.state).toBe("review");
    // the first card is graded at t=0, so it comes due exactly one day later
    expect(stored.cards["d1-0"]?.due).toBe(DAY_MS);
    expect(stored.history[0]?.reviews).toBe(deck.cards.length);
    expect(Object.keys(stored.cards)).toHaveLength(deck.cards.length);
  });

  it("hydrates a stored context into a fresh actor", () => {
    const storage = memoryStorage();
    persistData(
      {
        version: 2,
        cards: {
          c1: {
            seen: 1,
            known: 1,
            unknown: 0,
            last: 9,
            state: "review",
            due: 9 + DAY_MS,
            interval: 1,
            ease: 2.6,
            reps: 1,
            lapses: 0,
          },
        },
        stats: { sessions: 0, reviews: 1, known: 1, unknown: 0 },
        history: [{ day: "2026-08-01", reviews: 1, known: 1, unknown: 0 }],
        settings: { codeSize: 17, printWidth: 55, shuffle: true },
        session: {
          deckId: "d1",
          order: [0, 2, 1],
          idx: 1,
          known: 1,
          unknown: 0,
          skipped: 0,
          skippedCards: [],
          missed: [],
        },
      },
      storage,
    );
    const clock = new VirtualClock();
    const persisted = loadPersisted(storage);
    const actor = createAppActor({
      decks: {},
      clock,
      context: persisted
        ? {
            session: persisted.session,
            lastGrade: null,
            progress: persisted.cards,
            stats: persisted.stats,
            history: persisted.history,
            settings: persisted.settings,
            settingsFrom: null,
            detailDeckId: null,
            sectionId: null,
          }
        : undefined,
    });
    expect(actor.snapshot().context.progress["c1"]).toEqual({
      seen: 1,
      known: 1,
      unknown: 0,
      last: 9,
      state: "review",
      due: 9 + DAY_MS,
      interval: 1,
      ease: 2.6,
      reps: 1,
      lapses: 0,
    });
    expect(actor.snapshot().context.history).toEqual([
      { day: "2026-08-01", reviews: 1, known: 1, unknown: 0 },
    ]);
    expect(actor.snapshot().context.session?.idx).toBe(1);
    expect(actor.snapshot().context.settings).toEqual({
      codeSize: 17,
      printWidth: 55,
      shuffle: true,
    });
  });

  it("RESET_PROGRESS persists cleared progress but keeps the paused session", () => {
    const { actor, storage } = boot(1);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    actor.send(backToHome.create());
    actor.send(resetProgress.create());
    const stored = storedData(storage);
    expect(stored.cards).toEqual({});
    expect(stored.history).toEqual([]);
    expect(stored.stats).toEqual({ sessions: 0, reviews: 0, known: 0, unknown: 0 });
    expect(stored.session?.deckId).toBe("d1");
  });

  it("RESET wipes and persists the cleared state", () => {
    const { actor, storage } = boot(1);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    actor.send(reset.create());
    expect(storedData(storage)).toEqual(v2Empty());
  });
});
