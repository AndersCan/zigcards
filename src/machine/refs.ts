import { event, state } from "@mantaq/core";
import type { CodeSettings } from "./types.ts";

export const home = state("home")();
export const reviewFront = state("review.front")();
export const reviewBack = state("review.back")();
export const reviewGrading = state("review.grading")();
export const done = state("done")();
export const settings = state("settings")();
export const credits = state("credits")();

export const states = [
  home,
  reviewFront,
  reviewBack,
  reviewGrading,
  done,
  settings,
  credits,
] as const;

export const openDeck = event("OPEN_DECK")<{ deckId: string }>();
export const flip = event("FLIP")();
export const grade = event("GRADE")<{ known: boolean }>();
export const gradeDone = event("GRADE_DONE")();
export const backToHome = event("BACK_TO_HOME")();
export const restartDeck = event("RESTART_DECK")();
export const resetProgress = event("RESET_PROGRESS")();
export const reset = event("RESET")();
export const openSettings = event("OPEN_SETTINGS")();
export const closeSettings = event("CLOSE_SETTINGS")();
export const openCredits = event("OPEN_CREDITS")();
export const updateSettings = event("UPDATE_SETTINGS")<Partial<CodeSettings>>();

export const inputs = [
  openDeck,
  flip,
  grade,
  backToHome,
  restartDeck,
  resetProgress,
  reset,
  openSettings,
  closeSettings,
  openCredits,
  updateSettings,
] as const;

export const internal = [gradeDone] as const;
