import { beforeAll, beforeEach, expect, test } from "vite-plus/test";
import { commands, userEvent } from "vite-plus/test/browser";
import { bootstrapApp, resetUi, waitFor } from "./helpers";

declare module "vitest/browser" {
  interface BrowserCommands {
    swipe: (selector: string, dx: number) => Promise<void>;
  }
}

beforeAll(bootstrapApp);
beforeEach(resetUi);

function el(selector: string): HTMLElement {
  const node = document.querySelector(selector);
  if (!node) throw new Error(`${selector} not found`);
  return node as HTMLElement;
}

function count(selector: string): number {
  return document.querySelectorAll(selector).length;
}

function hidden(selector: string): boolean {
  const node = document.querySelector(selector);
  return node === null || (node as HTMLElement).hidden === true;
}

test("home lists all 9 decks", async () => {
  expect(count(".deck-row")).toBe(9);
  expect(el("#tb-title").textContent).toBe("ZigCards");
});

test("starting a deck shows the first card and progress", async () => {
  await userEvent.click(el(".deck-row"));
  expect(el("#card")).toBeDefined();
  expect(el("#tb-count").textContent).toBe("1/4");
  expect(el(".card-type").textContent).toBe("fix this");
  // front state: a clear "Show answer" action, no grade buttons yet
  expect(el("#btn-show")).toBeDefined();
  expect(count("#btn-known")).toBe(0);
  expect(count("#btn-unknown")).toBe(0);
  // only the review screen is visible
  expect(hidden("#screen-home")).toBe(true);
});

test("flip reveals the back, then grading advances", async () => {
  await userEvent.click(el(".deck-row"));
  await userEvent.click(el("#card"));
  expect(hidden("#card-back")).toBe(false);
  // grade buttons replace the Show-answer button and are on-screen
  expect(el("#btn-known")).toBeDefined();
  expect(el("#btn-unknown")).toBeDefined();
  expect(count("#btn-show")).toBe(0);

  const knownBox = el("#btn-known").getBoundingClientRect();
  expect(knownBox.y + knownBox.height).toBeLessThanOrEqual(844);

  await userEvent.click(el("#btn-known"));
  await waitFor(() => el("#tb-count").textContent === "2/4");
});

test("swipe right grades as known", async () => {
  await userEvent.click(el(".deck-row"));
  await userEvent.click(el("#card"));
  await commands.swipe("#card", 160);
  await waitFor(() => el("#tb-count").textContent === "2/4");
});

test("keyboard: space flips, arrow right grades", async () => {
  await userEvent.click(el(".deck-row"));
  await userEvent.keyboard(" ");
  expect(hidden("#card-back")).toBe(false);
  await userEvent.keyboard("{ArrowRight}");
  await waitFor(() => el("#tb-count").textContent === "2/4");
});

test("completing a session shows results and persists progress", async () => {
  await userEvent.click(el(".deck-row"));
  const total = 4;
  for (let i = 0; i < total; i++) {
    if (hidden("#card-back")) {
      await userEvent.click(el("#card"));
    }
    // alternate known/unknown to exercise both grade paths
    const btn = i % 2 === 0 ? "#btn-known" : "#btn-unknown";
    await userEvent.click(el(btn));
    await waitFor(() => count("#btn-show") > 0 || !hidden("#screen-done"));
  }
  expect(hidden("#screen-done")).toBe(false);
  expect(el("#screen-done h2").textContent).toBe("Session complete");

  const stored = JSON.parse(localStorage.getItem("zigcards.v1") ?? "{}") as {
    stats: { reviews: number };
  };
  expect(stored.stats.reviews).toBe(total);

  // back to decks; deck shows a progress badge
  await userEvent.click(el(".ghost-btn"));
  expect(hidden("#screen-home")).toBe(false);
  expect(el(".deck-row .badge").textContent).not.toBe("new");
});

test("back button returns home mid-session", async () => {
  await userEvent.click(el(".deck-row"));
  await userEvent.click(el("#btn-back"));
  expect(hidden("#screen-home")).toBe(false);
});

test("code blocks are highlighted by prism (token spans present)", async () => {
  await userEvent.click(el(".deck-row"));
  expect(count("pre.code .token")).toBeGreaterThan(0);
});
