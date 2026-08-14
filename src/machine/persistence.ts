import type { Snapshot } from "@mantaq/core";
import { DEFAULT_EASE, emptyStats } from "./context.ts";
import type {
  AppContext,
  CardProgress,
  CardState,
  CodeSettings,
  DayStats,
  SessionState,
  Stats,
} from "./types.ts";

export const STORAGE_KEY = "zigcards.v1";

const CURRENT_VERSION = 2;

const CODE_SIZE_RANGE: readonly [number, number] = [9, 20];
const PRINT_WIDTH_RANGE: readonly [number, number] = [40, 120];
const EASE_RANGE: readonly [number, number] = [1.3, 3.0];
const MAX_DAY_HISTORY = 366;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface PersistedData {
  version: number;
  cards: Record<string, CardProgress>;
  stats: Stats;
  history: DayStats[];
  settings: CodeSettings;
  session: SessionState | null;
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

function toClamped(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function isCardState(value: unknown): value is CardState {
  return value === "new" || value === "review" || value === "relearning";
}

function normalizeCards(cards: unknown): Record<string, CardProgress> {
  const out: Record<string, CardProgress> = {};
  if (cards && typeof cards === "object") {
    for (const [key, v] of Object.entries(cards as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const c = v as Partial<CardProgress>;
      const seen = toCount(c.seen);
      const known = toCount(c.known);
      const unknown = toCount(c.unknown);
      const last = toCount(c.last);
      // v1 data predates scheduling: derive a sane schedule from the tallies.
      const state = isCardState(c.state)
        ? c.state
        : seen > 0
          ? known > unknown
            ? "review"
            : "relearning"
          : "new";
      out[key] = {
        seen,
        known,
        unknown,
        last,
        state,
        // v1 has no `due`: fall back to `last` so reviewed cards are due now.
        due: toCount(c.due) || last || 0,
        interval: toCount(c.interval),
        ease: toClamped(c.ease, EASE_RANGE[0], EASE_RANGE[1], DEFAULT_EASE),
        reps: toCount(c.reps),
        lapses: toCount(c.lapses),
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
    shuffle: typeof s.shuffle === "boolean" ? s.shuffle : false,
  };
}

function normalizeHistory(history: unknown): DayStats[] {
  if (!Array.isArray(history)) return [];
  const seen = new Set<string>();
  const out: DayStats[] = [];
  for (const v of history) {
    if (!v || typeof v !== "object") continue;
    const h = v as Partial<DayStats>;
    if (typeof h.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(h.day)) continue;
    if (seen.has(h.day)) continue;
    seen.add(h.day);
    out.push({
      day: h.day,
      reviews: toCount(h.reviews),
      known: toCount(h.known),
      unknown: toCount(h.unknown),
    });
  }
  return out.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0)).slice(-MAX_DAY_HISTORY);
}

function normalizeSession(session: unknown): SessionState | null {
  if (!session || typeof session !== "object") return null;
  const s = session as Partial<SessionState>;
  if (typeof s.deckId !== "string" || !Array.isArray(s.order)) return null;
  const order = s.order.filter((n): n is number => typeof n === "number" && Number.isInteger(n));
  if (order.length === 0) return null;
  return {
    deckId: s.deckId,
    order,
    idx: Math.min(toCount(s.idx), order.length - 1),
    known: toCount(s.known),
    unknown: toCount(s.unknown),
    skipped: toCount(s.skipped),
    skippedCards: Array.isArray(s.skippedCards)
      ? s.skippedCards.filter((c): c is string => typeof c === "string")
      : [],
    missed: Array.isArray(s.missed)
      ? s.missed.filter((m): m is string => typeof m === "string")
      : [],
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
      history: normalizeHistory(d.history),
      settings: normalizeSettings(d.settings),
      session: normalizeSession(d.session),
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
      snapshot.context.history === prev.context.history &&
      snapshot.context.settings === prev.context.settings &&
      snapshot.context.session === prev.context.session
    ) {
      return;
    }
    persistData(
      {
        version: CURRENT_VERSION,
        cards: snapshot.context.progress,
        stats: snapshot.context.stats,
        history: snapshot.context.history,
        settings: snapshot.context.settings,
        session: snapshot.context.session,
      },
      storage,
    );
  });
}
