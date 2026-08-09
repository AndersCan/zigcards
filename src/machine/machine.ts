import { Actor, type Clock, type Context } from "@mantaq/core";
import { withTimeout } from "@mantaq/sugar";
import type { Deck } from "../types.ts";
import {
  advanceSession,
  clearSession,
  emptyStats,
  gradeCard,
  initialContext,
  recordReview,
  resetProgress as clearProgress,
  restartSession,
  startSession,
} from "./context.ts";
import {
  backToHome,
  done,
  flip,
  grade,
  gradeDone,
  home,
  inputs,
  internal,
  openDeck,
  pointerDown,
  pointerMove,
  pointerUp,
  reset,
  resetProgress,
  restartDeck,
  reviewBack,
  reviewFront,
  reviewGrading,
  states,
} from "./refs.ts";
import type { AppContext, DeckIndex } from "./types.ts";

export const SWIPE_THRESHOLD = 70;
export const GRADE_FLYOUT_MS = 240;

export type AppActor = ReturnType<typeof createAppActor>;
export type AppEvent = Parameters<AppActor["send"]>[0];

export interface AppMachineOptions {
  decks: DeckIndex;
  clock?: Clock;
  context?: AppContext;
  now?: () => number;
}

export function createAppActor(options: AppMachineOptions) {
  const { decks } = options;
  const now = options.now ?? (() => Date.now());

  const actor = new Actor({
    inputs,
    internal,
    states,
    initial: home,
    context: options.context ?? initialContext(),
    clock: options.clock,
    setup: (m) => {
      const currentDeck = (ctx: AppContext): Deck | null =>
        ctx.session ? (decks[ctx.session.deckId] ?? null) : null;

      const currentCard = (ctx: AppContext): Deck["cards"][number] | null => {
        const deck = currentDeck(ctx);
        if (!deck || !ctx.session) return null;
        return deck.cards[ctx.session.idx] ?? null;
      };

      const gradeKnown = (context: Context<AppContext>, known: boolean): boolean => {
        const ctx = context.get();
        const card = currentCard(ctx);
        if (!ctx.session || !card) return false;
        context.set(recordReview(gradeCard(ctx, known), card.id, known, now()));
        return true;
      };

      const leaveToHome = (context: Context<AppContext>) => {
        context.set(clearSession(context.get()));
        return { state: home };
      };

      const trackDown = (e: { x: number; y: number }, context: Context<AppContext>) => {
        context.set({ ...context.get(), drag: { x: e.x, y: e.y, dx: 0 } });
        return {};
      };

      const trackMove = (e: { x: number }, context: Context<AppContext>) => {
        const ctx = context.get();
        if (!ctx.drag) return {};
        context.set({ ...ctx, drag: { ...ctx.drag, dx: e.x - ctx.drag.x } });
        return {};
      };

      m.on(home, openDeck, (e, { context }) => {
        if (!decks[e.deckId]) return {};
        context.set(startSession(context.get(), e.deckId));
        return { state: reviewFront };
      });

      m.on(reviewFront, flip, () => ({ state: reviewBack }));

      m.on(reviewBack, grade, (e, { context }) =>
        gradeKnown(context, e.known) ? { state: reviewGrading } : {},
      );

      m.on(reviewGrading, gradeDone, (_, { context }) => {
        const ctx = context.get();
        const deck = currentDeck(ctx);
        if (!ctx.session || !deck) return { state: done };
        const nextIdx = ctx.session.idx + 1;
        context.set(advanceSession(ctx));
        return { state: nextIdx < deck.cards.length ? reviewFront : done };
      });

      m.on(reviewFront, backToHome, (_, { context }) => leaveToHome(context));
      m.on(reviewBack, backToHome, (_, { context }) => leaveToHome(context));
      m.on(reviewGrading, backToHome, (_, { context }) => leaveToHome(context));
      m.on(done, backToHome, (_, { context }) => leaveToHome(context));

      m.on(done, restartDeck, (_, { context }) => {
        context.set(restartSession(context.get()));
        return { state: reviewFront };
      });

      m.on(home, resetProgress, (_, { context }) => {
        context.set(clearProgress(context.get()));
        return { state: home };
      });

      m.onAny(reset, (_, { context }) => {
        const ctx = context.get();
        context.set({ ...clearSession(ctx), progress: {}, stats: emptyStats() });
        return { state: home };
      });

      m.on(reviewFront, pointerDown, (e, { context }) => trackDown(e, context));
      m.on(reviewBack, pointerDown, (e, { context }) => trackDown(e, context));
      m.on(reviewFront, pointerMove, (e, { context }) => trackMove(e, context));
      m.on(reviewBack, pointerMove, (e, { context }) => trackMove(e, context));

      m.on(reviewFront, pointerUp, (_, { context }) => {
        context.set({ ...context.get(), drag: null });
        return {};
      });

      m.on(reviewBack, pointerUp, (_, { context }) => {
        const ctx = context.get();
        const dx = ctx.drag?.dx ?? 0;
        context.set({ ...ctx, drag: null });
        if (Math.abs(dx) < SWIPE_THRESHOLD) return {};
        return gradeKnown(context, dx > 0) ? { state: reviewGrading } : {};
      });

      m.effect(reviewGrading, (input) =>
        withTimeout(GRADE_FLYOUT_MS, input, () => gradeDone.create()),
      );
    },
  });

  return actor;
}
