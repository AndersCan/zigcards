import type { Snapshot } from "@mantaq/core";
import { emptyStats } from "./context.ts";
import type { AppContext, CardProgress, Stats } from "./types.ts";

export const STORAGE_KEY = "zigcards.v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface PersistedData {
  cards: Record<string, CardProgress>;
  stats: Stats;
}

export function loadPersisted(storage: StorageLike): PersistedData | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<PersistedData>;
    return {
      cards: d.cards ?? {},
      stats: { ...emptyStats(), ...d.stats },
    };
  } catch {
    return null;
  }
}

export function persistData(data: PersistedData, storage: StorageLike): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable - in-memory only */
  }
}

export function attachPersistence(
  actor: {
    on(
      event: "change",
      fn: (snapshot: Snapshot<AppContext>, prev: Snapshot<AppContext>) => void,
    ): () => void;
  },
  storage: StorageLike,
): () => void {
  return actor.on("change", (snapshot, prev) => {
    if (
      snapshot.context.progress === prev.context.progress &&
      snapshot.context.stats === prev.context.stats
    ) {
      return;
    }
    persistData({ cards: snapshot.context.progress, stats: snapshot.context.stats }, storage);
  });
}
