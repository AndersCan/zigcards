import { beforeAll, beforeEach, expect, test } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { bootstrapApp, resetUi, waitFor } from "./helpers";

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

async function openDeckNamed(name: string): Promise<void> {
  const rows = [...document.querySelectorAll<HTMLElement>(".deck-row")];
  const row = rows.find((r) => r.querySelector(".name")?.textContent === name);
  if (!row) throw new Error(`deck row "${name}" not found`);
  await userEvent.click(row);
}

test("home lists every deck, grouped into sections", async () => {
  expect(count(".deck-row")).toBe(window.ZigCards.decks.length);
  expect(el("#tb-title").textContent).toBe("ZigCards");
  const heads = [...document.querySelectorAll(".section-title")].map((n) => n.textContent);
  expect(heads).toEqual(["Prerequisites", "Zig", "Mojo"]);
});

test("starting a deck shows the first card and progress", async () => {
  await openDeckNamed("Hello, Zig");
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
  await openDeckNamed("Hello, Zig");
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

test("keyboard: space flips, arrow right grades", async () => {
  await openDeckNamed("Hello, Zig");
  await userEvent.keyboard(" ");
  expect(hidden("#card-back")).toBe(false);
  await userEvent.keyboard("{ArrowRight}");
  await waitFor(() => el("#tb-count").textContent === "2/4");
});

test("completing a session shows results and persists progress", async () => {
  await openDeckNamed("Hello, Zig");
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

  // back to decks; the reviewed deck shows a progress badge
  await userEvent.click(el(".ghost-btn"));
  expect(hidden("#screen-home")).toBe(false);
  const helloRows = [...document.querySelectorAll<HTMLElement>(".deck-row")].filter((r) =>
    r.querySelector(".name")?.textContent?.includes("Hello"),
  );
  expect(helloRows[0]?.querySelector(".badge")?.textContent).not.toBe("new");
});

test("back button returns home mid-session", async () => {
  await openDeckNamed("Hello, Zig");
  await userEvent.click(el("#btn-back"));
  expect(hidden("#screen-home")).toBe(false);
});

test("code blocks are highlighted by prism (token spans present)", async () => {
  await openDeckNamed("Hello, Zig");
  expect(count("pre.code .token")).toBeGreaterThan(0);
});

test("credits page acknowledges ziglings and returns home", async () => {
  expect(hidden(".footer-note button")).toBe(false);
  await userEvent.click(el(".footer-note button"));
  expect(hidden("#screen-home")).toBe(true);
  expect(hidden("#screen-credits")).toBe(false);
  const text = document.body.textContent ?? "";
  expect(text).toContain("ziglings");
  expect(text).toContain("Dave Gauer");
  await userEvent.click(el("#btn-back"));
  expect(hidden("#screen-home")).toBe(false);
});

test("settings screen adjusts code size, applies it, and persists", async () => {
  expect(hidden("#btn-settings")).toBe(false);
  await userEvent.click(el("#btn-settings"));
  expect(hidden("#screen-home")).toBe(true);
  expect(hidden("#screen-settings")).toBe(false);

  const slider = el("#screen-settings input[aria-label='Code size']") as HTMLInputElement;
  slider.value = "10";
  slider.dispatchEvent(new Event("input", { bubbles: true }));

  await waitFor(() => document.documentElement.style.getPropertyValue("--code-size") === "10px");
  const stored = JSON.parse(localStorage.getItem("zigcards.v1") ?? "{}") as {
    settings?: { codeSize?: number };
  };
  expect(stored.settings?.codeSize).toBe(10);

  // reset to default so later tests are unaffected, then close
  await userEvent.click(el("#screen-settings .link-btn"));
  await waitFor(() => document.documentElement.style.getPropertyValue("--code-size") === "");
  await userEvent.click(el("#btn-back"));
  expect(hidden("#screen-home")).toBe(false);
});
