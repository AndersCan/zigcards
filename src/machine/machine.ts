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
  updateCodeSettings,
} from "./context.ts";
import {
  backToHome,
  closeSettings,
  credits,
  done,
  flip,
  grade,
  gradeDone,
  home,
  inputs,
  internal,
  openCredits,
  openDeck,
  openSettings,
  reset,
  resetProgress,
  restartDeck,
  reviewBack,
  reviewFront,
  reviewGrading,
  settings,
  states,
  updateSettings,
} from "./refs.ts";
import type { AppContext, CodeSettings, DeckIndex } from "./types.ts";

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

      const openSettingsStep =
        (source: string) =>
        (_: unknown, { context }: { context: Context<AppContext> }) => {
          context.set({ ...context.get(), settingsFrom: source });
          return { state: settings };
        };

      const settingsReturn = (source: string | null) => {
        if (source === "review.front") return reviewFront;
        if (source === "review.back") return reviewBack;
        return home;
      };

      m.on(home, openSettings, openSettingsStep("home"));
      m.on(reviewFront, openSettings, openSettingsStep("review.front"));
      m.on(reviewBack, openSettings, openSettingsStep("review.back"));

      m.on(settings, closeSettings, (_, { context }) => ({
        state: settingsReturn(context.get().settingsFrom),
      }));
      m.on(settings, backToHome, (_, { context }) => leaveToHome(context));

      m.on(home, openCredits, () => ({ state: credits }));
      m.on(credits, backToHome, (_, { context }) => leaveToHome(context));

      m.onAny(updateSettings, (e, { context }) => {
        const patch: Partial<CodeSettings> = {};
        if (e.codeSize !== undefined) patch.codeSize = e.codeSize;
        if (e.printWidth !== undefined) patch.printWidth = e.printWidth;
        context.set(updateCodeSettings(context.get(), patch));
        return {};
      });

      m.onAny(reset, (_, { context }) => {
        const ctx = context.get();
        context.set({ ...clearSession(ctx), progress: {}, stats: emptyStats() });
        return { state: home };
      });

      m.effect(reviewGrading, (input) =>
        withTimeout(GRADE_FLYOUT_MS, input, () => gradeDone.create()),
      );
    },
  });

  return actor;
}
