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
import type { AppContext, CodeSettings, DeckIndex, SettingsSource } from "./types.ts";

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
        context.set({ ...clearSession(context.get()), settingsFrom: null });
        return { state: home };
      };

      m.on(home, openDeck, (e, { context }) => {
        if (!decks[e.payload.deckId]) return {};
        context.set(startSession(context.get(), e.payload.deckId));
        return { state: reviewFront };
      });

      m.on(reviewFront, flip, () => ({ state: reviewBack }));

      m.on(reviewBack, grade, (e, { context }) =>
        gradeKnown(context, e.payload.known) ? { state: reviewGrading } : {},
      );

      m.on(reviewGrading, gradeDone, (_, { context }) => {
        const ctx = context.get();
        const deck = currentDeck(ctx);
        if (!ctx.session || !deck) return { state: done };
        const nextIdx = ctx.session.idx + 1;
        context.set({ ...advanceSession(ctx), lastGrade: null });
        return { state: nextIdx < deck.cards.length ? reviewFront : done };
      });

      // Deliberate drops: registered as no-ops so they don't spam the
      // "[Actor] no transition" warning (the warning = wiring bug rule).
      m.on(reviewBack, flip, () => ({}));
      m.on(reviewFront, grade, () => ({}));
      m.on(reviewGrading, grade, () => ({}));
      m.on(reviewGrading, openSettings, () => ({}));

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
        (from: SettingsSource) =>
        (_: unknown, { context }: { context: Context<AppContext> }) => {
          context.set({ ...context.get(), settingsFrom: from });
          return { state: settings };
        };

      m.on(home, openSettings, openSettingsStep(home));
      m.on(reviewFront, openSettings, openSettingsStep(reviewFront));
      m.on(reviewBack, openSettings, openSettingsStep(reviewBack));

      m.on(settings, closeSettings, (_, { context }) => {
        const ctx = context.get();
        context.set({ ...ctx, settingsFrom: null });
        return { state: ctx.settingsFrom ?? home };
      });
      m.on(settings, backToHome, (_, { context }) => leaveToHome(context));

      m.on(home, openCredits, () => ({ state: credits }));
      m.on(credits, backToHome, (_, { context }) => leaveToHome(context));

      m.onAny(updateSettings, (e, { context }) => {
        const patch: Partial<CodeSettings> = {};
        if (e.payload.codeSize !== undefined) patch.codeSize = e.payload.codeSize;
        if (e.payload.printWidth !== undefined) patch.printWidth = e.payload.printWidth;
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
