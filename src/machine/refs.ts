import { event, state } from "@mantaq/core";
import type { SectionId } from "../types.ts";
import type { CodeSettings } from "./types.ts";

export const home = state("home")();
export const section = state("section")();
export const reviewFront = state("review.front")();
export const reviewBack = state("review.back")();
export const reviewGrading = state("review.grading")();
export const done = state("done")();
export const settings = state("settings")();
export const credits = state("credits")();
export const deckDetail = state("deck.detail")();
export const stats = state("stats")();

export const states = [
  home,
  section,
  reviewFront,
  reviewBack,
  reviewGrading,
  done,
  settings,
  credits,
  deckDetail,
  stats,
] as const;

export const openSection = event("OPEN_SECTION")<{ sectionId: SectionId }>();
export const openDeck = event("OPEN_DECK")<{ deckId: string }>();
export const openDeckDetail = event("OPEN_DECK_DETAIL")<{ deckId: string }>();
export const openStats = event("OPEN_STATS")();
export const flip = event("FLIP")();
export const grade = event("GRADE")<{ known: boolean }>();
export const skip = event("SKIP")();
export const gradeDone = event("GRADE_DONE")();
export const backToHome = event("BACK_TO_HOME")();
export const restartDeck = event("RESTART_DECK")();
export const drillMissed = event("DRILL_MISSED")();
export const resetProgress = event("RESET_PROGRESS")();
export const reset = event("RESET")();
export const openSettings = event("OPEN_SETTINGS")();
export const closeSettings = event("CLOSE_SETTINGS")();
export const openCredits = event("OPEN_CREDITS")();
export const updateSettings = event("UPDATE_SETTINGS")<Partial<CodeSettings>>();

export const inputs = [
  openSection,
  openDeck,
  openDeckDetail,
  openStats,
  flip,
  grade,
  skip,
  backToHome,
  restartDeck,
  drillMissed,
  resetProgress,
  reset,
  openSettings,
  closeSettings,
  openCredits,
  updateSettings,
] as const;

export const internal = [gradeDone] as const;
