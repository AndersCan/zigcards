import type { Deck } from "./types.ts";

/* Lightweight local progress store (no scheduling).
   Persists per-card know/didn't-know history and session stats. */

const KEY = "zigcards.v1";

export interface CardProgress {
  seen: number;
  known: number;
  unknown: number;
  last: number;
}

export interface Stats {
  sessions: number;
  reviews: number;
  known: number;
  unknown: number;
}

export interface StoreData {
  cards: Record<string, CardProgress>;
  stats: Stats;
}

function defaults(): StoreData {
  return {
    cards: {},
    stats: { sessions: 0, reviews: 0, known: 0, unknown: 0 },
  };
}

function load(): StoreData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const d = JSON.parse(raw) as Partial<StoreData>;
    return {
      cards: d.cards ?? {},
      stats: { ...defaults().stats, ...d.stats },
    };
  } catch {
    return defaults();
  }
}

let data = load();

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — run in-memory only */
  }
}

const emptyProgress: CardProgress = { seen: 0, known: 0, unknown: 0, last: 0 };

export const store = {
  record(cardId: string, known: boolean): void {
    const p = data.cards[cardId] ?? { ...emptyProgress };
    p.seen += 1;
    if (known) p.known += 1;
    else p.unknown += 1;
    p.last = Date.now();
    data.cards[cardId] = p;
    data.stats.reviews += 1;
    data.stats.known += known ? 1 : 0;
    data.stats.unknown += known ? 0 : 1;
    save();
  },

  progress(cardId: string): CardProgress {
    return data.cards[cardId] ?? { ...emptyProgress };
  },

  deckProgress(deck: Deck): { seen: number; known: number; total: number } {
    let seen = 0;
    let known = 0;
    for (const c of deck.cards) {
      const p = data.cards[c.id];
      if (p) {
        seen += 1;
        known += p.known > p.unknown ? 1 : 0;
      }
    }
    return { seen, known, total: deck.cards.length };
  },

  get stats(): Stats {
    return data.stats;
  },

  reset(): void {
    data = defaults();
    save();
  },
};
