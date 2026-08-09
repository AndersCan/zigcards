import { event, state } from "@mantaq/core";

export const home = state("home")();
export const reviewFront = state("review.front")();
export const reviewBack = state("review.back")();
export const reviewGrading = state("review.grading")();
export const done = state("done")();

export const states = [home, reviewFront, reviewBack, reviewGrading, done] as const;

export const openDeck = event("OPEN_DECK")<{ deckId: string }>();
export const flip = event("FLIP")();
export const grade = event("GRADE")<{ known: boolean }>();
export const gradeDone = event("GRADE_DONE")();
export const backToHome = event("BACK_TO_HOME")();
export const restartDeck = event("RESTART_DECK")();
export const resetProgress = event("RESET_PROGRESS")();
export const reset = event("RESET")();
export const pointerDown = event("POINTER_DOWN")<{ x: number; y: number }>();
export const pointerMove = event("POINTER_MOVE")<{ x: number }>();
export const pointerUp = event("POINTER_UP")();

export const inputs = [
  openDeck,
  flip,
  grade,
  backToHome,
  restartDeck,
  resetProgress,
  reset,
  pointerDown,
  pointerMove,
  pointerUp,
] as const;

export const internal = [gradeDone] as const;
