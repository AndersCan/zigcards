import type { Deck, SectionId } from "../types.ts";
import type { StateRef } from "@mantaq/core";

export type SettingsSource =
  | StateRef<"home", unknown, false>
  | StateRef<"section", unknown, false>
  | StateRef<"review.front", unknown, false>
  | StateRef<"review.back", unknown, false>
  | StateRef<"deck.detail", unknown, false>
  | StateRef<"stats", unknown, false>;

export type CardState = "new" | "review" | "relearning";

export interface SessionState {
  deckId: string;
  order: number[];
  idx: number;
  known: number;
  unknown: number;
  skipped: number;
  skippedCards: string[];
  missed: string[];
}

export interface CardProgress {
  seen: number;
  known: number;
  unknown: number;
  last: number;
  state: CardState;
  due: number;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
}

export interface DayStats {
  day: string;
  reviews: number;
  known: number;
  unknown: number;
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
  shuffle: boolean;
}

export interface AppContext {
  session: SessionState | null;
  lastGrade: { known: boolean } | null;
  progress: Record<string, CardProgress>;
  stats: Stats;
  history: DayStats[];
  settings: CodeSettings;
  settingsFrom: SettingsSource | null;
  detailDeckId: string | null;
  sectionId: SectionId | null;
}

export type DeckIndex = Record<string, Deck>;
