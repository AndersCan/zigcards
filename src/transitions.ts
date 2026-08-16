/* View-transition plumbing, ported from the Justus app
   (github.com/AndersCan/justus — apps/web/src/use-store.ts). Justus wraps its
   store-driven DOM updates in `document.startViewTransition()` so the browser
   cross-fades between the old and new state, and gives stable elements a
   unique `view-transition-name` (its photo grid) so they animate in place.

   zigcards reuses the same machinery: `withViewTransition` runs a re-render
   inside a view transition, with a direct-update fallback when the API is
   missing, a transition is already running, or the user prefers reduced
   motion.

   Two deliberate differences from Justus:
   - The update callback runs asynchronously (the browser captures the old
     state first, then invokes the callback), so the DOM changes a task after
     the machine event. The review flow's own CSS animations (flip reveal,
     grade fly-out) depend on immediate re-renders, so only screen navigation
     is wrapped here; within-review updates stay synchronous (see app.ts).
   - Overlapping updates are not deferred (Justus queues them to keep its
     photo grid tear-free). If a transition is already running, the update
     applies directly and plays without animation. Callers guard against a
     stale queued callback clobbering a newer render (see app.ts). */

let active: ViewTransition | null = null;
let animating = false;

function reduceMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Run `update` inside a view transition when the browser supports it and no
 *  transition is already in flight; otherwise run it directly. Note the DOM
 *  mutation happens asynchronously (in the transition's update callback),
 *  so callers must not rely on it being done before this returns. */
export function withViewTransition(update: () => void): void {
  const start =
    typeof document !== "undefined" ? document.startViewTransition.bind(document) : undefined;
  if (!start || active !== null || animating || reduceMotion()) {
    update();
    return;
  }
  animating = true;
  let transition: ViewTransition;
  try {
    transition = start(update);
  } catch {
    animating = false;
    update();
    return;
  }
  active = transition;
  void transition.updateCallbackDone.catch(() => {});
  void transition.ready.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      animating = false;
      if (active === transition) active = null;
    });
}
