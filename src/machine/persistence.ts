import type { Snapshot } from "@mantaq/core";
import { emptyStats } from "./context.ts";
import type { AppContext, CardProgress, CodeSettings, Stats } from "./types.ts";

export const STORAGE_KEY = "zigcards.v1";

const CURRENT_VERSION = 1;

const CODE_SIZE_RANGE: readonly [number, number] = [9, 20];
const PRINT_WIDTH_RANGE: readonly [number, number] = [40, 120];

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface PersistedData {
  version: number;
  cards: Record<string, CardProgress>;
  stats: Stats;
  settings: CodeSettings;
}

function toCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function toNullableClamped(value: unknown, min: number, max: number): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function normalizeCards(cards: unknown): Record<string, CardProgress> {
  const out: Record<string, CardProgress> = {};
  if (cards && typeof cards === "object") {
    for (const [key, v] of Object.entries(cards as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const c = v as Partial<CardProgress>;
      out[key] = {
        seen: toCount(c.seen),
        known: toCount(c.known),
        unknown: toCount(c.unknown),
        last: toCount(c.last),
      };
    }
  }
  return out;
}

function normalizeStats(stats: unknown): Stats {
  const s = (stats && typeof stats === "object" ? stats : {}) as Partial<Stats>;
  const base = emptyStats();
  return {
    sessions: toCount(s.sessions) || base.sessions,
    reviews: toCount(s.reviews) || base.reviews,
    known: toCount(s.known) || base.known,
    unknown: toCount(s.unknown) || base.unknown,
  };
}

function normalizeSettings(settings: unknown): CodeSettings {
  const s = (settings && typeof settings === "object" ? settings : {}) as Partial<CodeSettings>;
  return {
    codeSize: toNullableClamped(s.codeSize, CODE_SIZE_RANGE[0], CODE_SIZE_RANGE[1]),
    printWidth: toNullableClamped(s.printWidth, PRINT_WIDTH_RANGE[0], PRINT_WIDTH_RANGE[1]),
  };
}

export function loadPersisted(storage: StorageLike): PersistedData | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<PersistedData>;
    // d.version: v1 data predates the version field; treat as 1.
    return {
      version: CURRENT_VERSION,
      cards: normalizeCards(d.cards),
      stats: normalizeStats(d.stats),
      settings: normalizeSettings(d.settings),
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
      snapshot.context.stats === prev.context.stats &&
      snapshot.context.settings === prev.context.settings
    ) {
      return;
    }
    persistData(
      {
        version: CURRENT_VERSION,
        cards: snapshot.context.progress,
        stats: snapshot.context.stats,
        settings: snapshot.context.settings,
      },
      storage,
    );
  });
}
