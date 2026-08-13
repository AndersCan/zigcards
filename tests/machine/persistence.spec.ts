import { describe, expect, it } from "vite-plus/test";
import { VirtualClock } from "@mantaq/core";
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
  updateSettings,
} from "../../src/machine/refs.ts";
import type { Card, Deck } from "../../src/types.ts";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
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

function storedStats(storage: StorageLike & { data: Map<string, string> }): PersistedData {
  return JSON.parse(storage.data.get(STORAGE_KEY) ?? "{}") as PersistedData;
}

describe("persistence", () => {
  it("round-trips persisted data", () => {
    const storage = memoryStorage();
    const data: PersistedData = {
      version: 1,
      cards: { a: { seen: 1, known: 1, unknown: 0, last: 5 } },
      stats: { sessions: 0, reviews: 1, known: 1, unknown: 0 },
      settings: { codeSize: 15, printWidth: 70 },
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

  it("hydrates defaults for missing keys", () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ stats: { reviews: 4 } }));
    expect(loadPersisted(storage)).toEqual({
      version: 1,
      cards: {},
      stats: { sessions: 0, reviews: 4, known: 0, unknown: 0 },
      settings: { codeSize: null, printWidth: null },
    });
  });

  it("validates and clamps persisted data", () => {
    const storage = memoryStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        stats: { reviews: "oops" },
        cards: { a: { seen: -3, known: 1, unknown: 0, last: "x" } },
        settings: { codeSize: 999, printWidth: 5 },
      }),
    );
    expect(loadPersisted(storage)).toEqual({
      version: 1,
      cards: { a: { seen: 0, known: 1, unknown: 0, last: 0 } },
      stats: { sessions: 0, reviews: 0, known: 0, unknown: 0 },
      settings: { codeSize: 20, printWidth: 40 },
    });
  });

  it("loads pre-version data (legacy shape without a version field)", () => {
    const storage = memoryStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cards: {},
        stats: { sessions: 0, reviews: 2, known: 1, unknown: 1 },
        settings: { codeSize: null, printWidth: null },
      }),
    );
    expect(loadPersisted(storage)?.version).toBe(1);
    expect(loadPersisted(storage)?.stats.reviews).toBe(2);
  });

  it("persists code settings changes", () => {
    const { actor, storage } = boot();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    expect(storage.data.has(STORAGE_KEY)).toBe(false);
    actor.send(updateSettings.create({ codeSize: 16, printWidth: 60 }));
    expect(storedStats(storage).settings).toEqual({ codeSize: 16, printWidth: 60 });
  });

  it("writes only when progress or stats change", () => {
    const { actor, storage } = boot();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    expect(storage.data.has(STORAGE_KEY)).toBe(false);
    actor.send(grade.create({ known: true }));
    expect(storedStats(storage).stats.reviews).toBe(1);
  });

  it("advancing to the next card does not rewrite storage", () => {
    const { actor, clock, storage } = boot();
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    const writes = storage.data.size;
    clock.advance(GRADE_FLYOUT_MS);
    expect(storage.data.size).toBe(writes);
  });

  it("persists the full review tally", () => {
    const { actor, clock, storage, deck } = boot(3);
    actor.send(openDeck.create({ deckId: "d1" }));
    for (const [i] of deck.cards.entries()) {
      actor.send(flip.create());
      actor.send(grade.create({ known: i % 2 === 0 }));
      clock.advance(GRADE_FLYOUT_MS);
    }
    const stored = storedStats(storage);
    expect(stored.stats.reviews).toBe(deck.cards.length);
    expect(stored.cards["d1-0"]?.seen).toBe(1);
    expect(Object.keys(stored.cards)).toHaveLength(deck.cards.length);
  });

  it("hydrates a stored context into a fresh actor", () => {
    const storage = memoryStorage();
    persistData(
      {
        version: 1,
        cards: { c1: { seen: 1, known: 1, unknown: 0, last: 9 } },
        stats: { sessions: 0, reviews: 1, known: 1, unknown: 0 },
        settings: { codeSize: 17, printWidth: 55 },
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
            session: null,
            lastGrade: null,
            progress: persisted.cards,
            stats: persisted.stats,
            settings: persisted.settings,
            settingsFrom: null,
          }
        : undefined,
    });
    expect(actor.snapshot().context.progress["c1"]).toEqual({
      seen: 1,
      known: 1,
      unknown: 0,
      last: 9,
    });
    expect(actor.snapshot().context.settings).toEqual({ codeSize: 17, printWidth: 55 });
  });

  it("RESET_PROGRESS persists the cleared data", () => {
    const { actor, storage } = boot(1);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    actor.send(backToHome.create());
    actor.send(resetProgress.create());
    expect(storedStats(storage)).toEqual({
      version: 1,
      cards: {},
      stats: { sessions: 0, reviews: 0, known: 0, unknown: 0 },
      settings: { codeSize: null, printWidth: null },
    });
  });

  it("RESET wipes and persists the cleared state", () => {
    const { actor, storage } = boot(1);
    actor.send(openDeck.create({ deckId: "d1" }));
    actor.send(flip.create());
    actor.send(grade.create({ known: true }));
    actor.send(reset.create());
    expect(storedStats(storage)).toEqual({
      version: 1,
      cards: {},
      stats: { sessions: 0, reviews: 0, known: 0, unknown: 0 },
      settings: { codeSize: null, printWidth: null },
    });
  });
});
