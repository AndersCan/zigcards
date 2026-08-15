import { Actor, type Clock, type Context } from "@mantaq/core";
import { withTimeout } from "@mantaq/sugar";
import type { Deck } from "../types.ts";
import { SECTIONS } from "../sections.ts";
import {
  advanceSession,
  beginSession,
  buildQueue,
  clearSession,
  emptyStats,
  gradeCard,
  initialContext,
  pauseSession,
  recordReview,
  resetProgress as clearProgress,
  skipCard,
  updateCodeSettings,
} from "./context.ts";
import {
  backToHome,
  closeSettings,
  credits,
  deckDetail,
  done,
  drillMissed,
  flip,
  grade,
  gradeDone,
  home,
  inputs,
  internal,
  openCredits,
  openDeck,
  openDeckDetail,
  openSection,
  openSettings,
  openStats,
  reset,
  resetProgress,
  restartDeck,
  reviewBack,
  reviewFront,
  reviewGrading,
  section,
  settings,
  skip,
  states,
  stats,
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
  random?: () => number;
}

export function createAppActor(options: AppMachineOptions) {
  const { decks } = options;
  const random = options.random ?? Math.random;

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
        return deck.cards[ctx.session.order[ctx.session.idx]] ?? null;
      };

      const gradeKnown = (context: Context<AppContext>, known: boolean, now: number): boolean => {
        const ctx = context.get();
        const card = currentCard(ctx);
        if (!ctx.session || !card) return false;
        context.set(recordReview(gradeCard(ctx, card.id, known), card.id, known, now));
        return true;
      };

      /** Resume a paused session for the deck, or start a fresh due+new pass. */
      const startOrResumeDeck = (deckId: string, context: Context<AppContext>, clock: Clock) => {
        if (!decks[deckId]) return { ok: false } as const;
        const ctx = context.get();
        if (ctx.session?.deckId === deckId) {
          context.set(pauseSession(ctx));
          return {
            ok: true,
            state: ctx.session.idx >= ctx.session.order.length ? done : reviewFront,
          } as const;
        }
        const order = buildQueue(decks[deckId], ctx.progress, {
          now: clock.now(),
          shuffle: ctx.settings.shuffle,
          random,
        });
        context.set(beginSession(ctx, deckId, order));
        return { ok: true, state: order.length ? reviewFront : done } as const;
      };

      const skipStep = (_: unknown, { context }: { context: Context<AppContext> }) => {
        const ctx = context.get();
        const card = currentCard(ctx);
        if (!ctx.session || !card) return {};
        context.set(skipCard(ctx, card.id));
        const s = context.get().session;
        return s && s.idx >= s.order.length ? { state: done } : { state: reviewFront };
      };

      const sectionExists = (id: string): boolean => SECTIONS.some((s) => s.id === id);

      /** Sub-screens (review/detail/settings/done) return one level up: the
       *  section picker when entered from a section, else the home picker. */
      const backTarget = (ctx: AppContext) => ({
        state: ctx.sectionId ? section : home,
      });

      const pauseToHome = (context: Context<AppContext>) => {
        const ctx = context.get();
        context.set({ ...pauseSession(ctx), settingsFrom: null, detailDeckId: null });
        return backTarget(ctx);
      };

      const finishToHome = (context: Context<AppContext>) => {
        const ctx = context.get();
        context.set({ ...clearSession(ctx), settingsFrom: null, detailDeckId: null });
        return backTarget(ctx);
      };

      m.on(home, openSection, (e, { context }) => {
        if (!sectionExists(e.payload.sectionId)) return {};
        context.set({
          ...context.get(),
          sectionId: e.payload.sectionId,
          settingsFrom: null,
          detailDeckId: null,
        });
        return { state: section };
      });

      m.on(section, openDeck, (e, { context, actor }) => {
        const r = startOrResumeDeck(e.payload.deckId, context, actor.clock);
        return r.ok ? { state: r.state } : {};
      });

      m.on(section, openDeckDetail, (e, { context }) => {
        if (!decks[e.payload.deckId]) return {};
        context.set({ ...context.get(), detailDeckId: e.payload.deckId });
        return { state: deckDetail };
      });

      m.on(section, backToHome, (_, { context }) => {
        context.set({ ...context.get(), sectionId: null, settingsFrom: null, detailDeckId: null });
        return { state: home };
      });

      m.on(home, openDeck, (e, { context, actor }) => {
        const r = startOrResumeDeck(e.payload.deckId, context, actor.clock);
        return r.ok ? { state: r.state } : {};
      });

      m.on(deckDetail, openDeck, (e, { context, actor }) => {
        const r = startOrResumeDeck(e.payload.deckId, context, actor.clock);
        return r.ok ? { state: r.state } : {};
      });

      m.on(home, openDeckDetail, (e, { context }) => {
        if (!decks[e.payload.deckId]) return {};
        context.set({ ...context.get(), detailDeckId: e.payload.deckId });
        return { state: deckDetail };
      });

      m.on(home, openStats, () => ({ state: stats }));

      m.on(reviewFront, flip, () => ({ state: reviewBack }));

      m.on(reviewBack, grade, (e, { context, actor }) =>
        gradeKnown(context, e.payload.known, actor.clock.now()) ? { state: reviewGrading } : {},
      );

      m.on(reviewGrading, gradeDone, (_, { context }) => {
        const ctx = context.get();
        const session = ctx.session;
        if (!session) return { state: done };
        const nextIdx = session.idx + 1;
        context.set({ ...advanceSession(ctx), lastGrade: null });
        return { state: nextIdx < session.order.length ? reviewFront : done };
      });

      m.on(reviewFront, skip, skipStep);
      m.on(reviewBack, skip, skipStep);

      // Deliberate drops: registered as no-ops so they don't spam the
      // "[Actor] no transition" warning (the warning = wiring bug rule).
      m.on(reviewBack, flip, () => ({}));
      m.on(reviewFront, grade, () => ({}));
      m.on(reviewGrading, grade, () => ({}));
      m.on(reviewGrading, openSettings, () => ({}));

      m.on(reviewFront, backToHome, (_, { context }) => pauseToHome(context));
      m.on(reviewBack, backToHome, (_, { context }) => pauseToHome(context));
      m.on(reviewGrading, backToHome, (_, { context }) => pauseToHome(context));
      m.on(done, backToHome, (_, { context }) => finishToHome(context));
      m.on(deckDetail, backToHome, (_, { context }) => pauseToHome(context));
      m.on(stats, backToHome, (_, { context }) => pauseToHome(context));

      m.on(done, restartDeck, (_, { context, actor }) => {
        const ctx = context.get();
        const session = ctx.session;
        if (!session || !decks[session.deckId]) return {};
        const order = buildQueue(decks[session.deckId], ctx.progress, {
          now: actor.clock.now(),
          shuffle: ctx.settings.shuffle,
          random,
          force: true,
        });
        context.set(beginSession(ctx, session.deckId, order));
        return { state: order.length ? reviewFront : done };
      });

      m.on(done, drillMissed, (_, { context, actor }) => {
        const ctx = context.get();
        const session = ctx.session;
        if (!session || !decks[session.deckId] || session.missed.length === 0) return {};
        const order = buildQueue(decks[session.deckId], ctx.progress, {
          now: actor.clock.now(),
          shuffle: ctx.settings.shuffle,
          random,
          only: session.missed,
        });
        context.set(beginSession(ctx, session.deckId, order));
        return { state: order.length ? reviewFront : done };
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
      m.on(section, openSettings, openSettingsStep(section));
      m.on(reviewFront, openSettings, openSettingsStep(reviewFront));
      m.on(reviewBack, openSettings, openSettingsStep(reviewBack));
      m.on(deckDetail, openSettings, openSettingsStep(deckDetail));
      m.on(stats, openSettings, openSettingsStep(stats));

      m.on(settings, closeSettings, (_, { context }) => {
        const ctx = context.get();
        context.set({ ...ctx, settingsFrom: null });
        return { state: ctx.settingsFrom ?? home };
      });
      m.on(settings, backToHome, (_, { context }) => pauseToHome(context));

      m.on(home, openCredits, () => ({ state: credits }));
      m.on(credits, backToHome, (_, { context }) => pauseToHome(context));

      m.onAny(updateSettings, (e, { context }) => {
        const patch: Partial<CodeSettings> = {};
        if (e.payload.codeSize !== undefined) patch.codeSize = e.payload.codeSize;
        if (e.payload.printWidth !== undefined) patch.printWidth = e.payload.printWidth;
        if (e.payload.shuffle !== undefined) patch.shuffle = e.payload.shuffle;
        context.set(updateCodeSettings(context.get(), patch));
        return {};
      });

      m.onAny(reset, (_, { context }) => {
        const ctx = context.get();
        context.set({
          ...clearSession(ctx),
          progress: {},
          stats: emptyStats(),
          history: [],
          settingsFrom: null,
          detailDeckId: null,
          sectionId: null,
        });
        return { state: home };
      });

      m.effect(reviewGrading, (input) =>
        withTimeout(GRADE_FLYOUT_MS, input, () => gradeDone.create()),
      );
    },
  });

  return actor;
}
