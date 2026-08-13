import type { Deck } from "../types.ts";
import type { StateRef } from "@mantaq/core";

export type SettingsSource =
  | StateRef<"home", unknown, false>
  | StateRef<"review.front", unknown, false>
  | StateRef<"review.back", unknown, false>;

export interface SessionState {
  deckId: string;
  idx: number;
  known: number;
  unknown: number;
}

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

export interface CodeSettings {
  codeSize: number | null;
  printWidth: number | null;
}

export interface AppContext {
  session: SessionState | null;
  lastGrade: { known: boolean } | null;
  progress: Record<string, CardProgress>;
  stats: Stats;
  settings: CodeSettings;
  settingsFrom: SettingsSource | null;
}

export type DeckIndex = Record<string, Deck>;
