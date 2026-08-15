import { beforeAll, beforeEach, expect, test } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { SECTIONS } from "../src/sections.ts";
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

function sectionTitleForDeck(name: string): string {
  const deck = window.ZigCards.decks.find((d) => d.title === name);
  const sec = SECTIONS.find((s) => s.id === deck?.section);
  if (!sec) throw new Error(`no section for deck "${name}"`);
  return sec.title;
}

async function openSectionNamed(title: string): Promise<void> {
  const cards = [...document.querySelectorAll<HTMLElement>(".section-card")];
  const card = cards.find((c) => c.querySelector(".section-title")?.textContent === title);
  if (!card) throw new Error(`section card "${title}" not found`);
  await userEvent.click(card);
  await waitFor(() => !hidden("#screen-section"));
}

async function openDeckNamed(name: string): Promise<void> {
  if (hidden("#screen-section")) {
    await openSectionNamed(sectionTitleForDeck(name));
  }
  const rows = [...document.querySelectorAll<HTMLElement>(".deck-row")];
  const row = rows.find((r) => r.querySelector(".name")?.textContent === name);
  if (!row) throw new Error(`deck row "${name}" not found`);
  await userEvent.click(row);
}

test("home lists sections, not decks", async () => {
  expect(count(".deck-row")).toBe(0);
  expect(count(".section-card")).toBe(3);
  expect(el("#tb-title").textContent).toBe("ZigCards");
  const heads = [...document.querySelectorAll(".section-card .section-title")].map(
    (n) => n.textContent,
  );
  expect(heads).toEqual(["Prerequisites", "Zig", "Mojo"]);
});

test("opening a section shows only that section's decks", async () => {
  await openSectionNamed("Zig");
  const names = [...document.querySelectorAll<HTMLElement>(".deck-row .name")].map(
    (n) => n.textContent,
  );
  expect(names.length).toBeGreaterThan(0);
  expect(names).toContain("Hello, Zig");
  expect(names).not.toContain("Memory basics");
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
  expect(hidden("#screen-section")).toBe(true);
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

  // back to the deck list; the reviewed deck shows a progress badge
  await userEvent.click(el(".ghost-btn"));
  expect(hidden("#screen-section")).toBe(false);
  const helloRows = [...document.querySelectorAll<HTMLElement>(".deck-row")].filter((r) =>
    r.querySelector(".name")?.textContent?.includes("Hello"),
  );
  expect(helloRows[0]?.querySelector(".badge")?.textContent).not.toBe("new");
});

test("back button returns to the section mid-session", async () => {
  await openDeckNamed("Hello, Zig");
  await userEvent.click(el("#btn-back"));
  expect(hidden("#screen-section")).toBe(false);
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

function persisted(): Record<string, unknown> {
  return JSON.parse(localStorage.getItem("zigcards.v1") ?? "{}") as Record<string, unknown>;
}

test("skip advances without recording a review and re-queues the card", async () => {
  await openDeckNamed("Hello, Zig");
  const firstFront = el(".card-front").textContent;
  await userEvent.click(el("#btn-skip"));
  // the queue re-orders (current card moves to the end) but the index stays put
  await waitFor(() => el(".card-front").textContent !== firstFront);
  expect(el("#tb-count").textContent).toBe("1/4");
  const afterSkip = persisted() as { stats: { reviews: number } };
  expect(afterSkip.stats?.reviews).toBe(0);

  // grade everything else; the skipped card comes back last
  for (let i = 1; i <= 4; i++) {
    if (i === 4) {
      expect(el(".card-front").textContent).toBe(firstFront);
    }
    if (hidden("#card-back")) {
      await userEvent.click(el("#card"));
    }
    await userEvent.click(el("#btn-known"));
    await waitFor(() => count("#btn-show") > 0 || !hidden("#screen-done"));
  }
  expect(hidden("#screen-done")).toBe(false);
  const done = persisted() as { stats: { reviews: number }; session: { skipped: number } };
  expect(done.stats?.reviews).toBe(4);
  expect(done.session?.skipped).toBe(1);
});

test("Review missed drills only the missed card", async () => {
  await openDeckNamed("Hello, Zig");
  for (let i = 0; i < 4; i++) {
    if (hidden("#card-back")) {
      await userEvent.click(el("#card"));
    }
    const btn = i === 1 ? "#btn-unknown" : "#btn-known";
    await userEvent.click(el(btn));
    await waitFor(() => count("#btn-show") > 0 || !hidden("#screen-done"));
  }
  expect(hidden("#screen-done")).toBe(false);
  expect(el("#screen-done h2").textContent).toBe("Session complete");
  expect(el("#screen-done").textContent).toContain("Review missed (1)");

  await userEvent.click(el("#screen-done .primary-btn"));
  await waitFor(() => !hidden("#screen-review"));
  expect(el("#tb-count").textContent).toBe("1/1");
  if (hidden("#card-back")) {
    await userEvent.click(el("#card"));
  }
  await userEvent.click(el("#btn-known"));
  await waitFor(() => !hidden("#screen-done"));
});

test("empty queue reaches the all-caught-up done state", async () => {
  await openDeckNamed("Hello, Zig");
  for (let i = 0; i < 4; i++) {
    if (hidden("#card-back")) {
      await userEvent.click(el("#card"));
    }
    await userEvent.click(el("#btn-known"));
    await waitFor(() => count("#btn-show") > 0 || !hidden("#screen-done"));
  }
  expect(hidden("#screen-done")).toBe(false);
  await userEvent.click(el(".ghost-btn"));
  await waitFor(() => !hidden("#screen-section"));

  // every card is now scheduled for tomorrow, so reopening reaches done
  // immediately with the "all caught up" empty state
  await openDeckNamed("Hello, Zig");
  await waitFor(() => !hidden("#screen-done"));
  expect(el("#screen-done h2").textContent).toBe("All caught up!");
  expect(el("#screen-done").textContent).toContain("No cards are due right now");

  // Practice all cards force-starts the whole deck again
  await userEvent.click(el("#screen-done .primary-btn"));
  await waitFor(() => !hidden("#screen-review"));
  expect(el("#tb-count").textContent).toBe("1/4");
});

test("mid-session exit shows a resume badge and reopening resumes", async () => {
  await openDeckNamed("Hello, Zig");
  await userEvent.click(el("#card"));
  await userEvent.click(el("#btn-known"));
  await waitFor(() => el("#tb-count").textContent === "2/4");
  await userEvent.click(el("#btn-back"));
  await waitFor(() => !hidden("#screen-section"));

  const row = [...document.querySelectorAll<HTMLElement>(".deck-row")].find(
    (r) => r.querySelector(".name")?.textContent === "Hello, Zig",
  );
  expect(row?.querySelector(".badge.resume")?.textContent).toBe("resume");
  if (!row) throw new Error("Hello, Zig row not found");

  await userEvent.click(row);
  await waitFor(() => !hidden("#screen-review"));
  expect(el("#tb-count").textContent).toBe("2/4");
});

test("deck detail lists per-card progress after grading", async () => {
  await openDeckNamed("Hello, Zig");
  await userEvent.click(el("#card"));
  await userEvent.click(el("#btn-unknown"));
  await waitFor(() => el("#tb-count").textContent === "2/4");
  await userEvent.click(el("#btn-back"));
  await waitFor(() => !hidden("#screen-section"));

  const row = [...document.querySelectorAll<HTMLElement>(".deck-row")].find(
    (r) => r.querySelector(".name")?.textContent === "Hello, Zig",
  );
  const info = row?.querySelector(".row-info");
  if (!info) throw new Error("row info button not found");
  await userEvent.click(info);
  await waitFor(() => !hidden("#screen-deck-detail"));
  expect(hidden("#screen-home")).toBe(true);
  expect(el("#tb-title").textContent).toBe("Hello, Zig");
  expect(hidden("#tb-count")).toBe(true);

  const cards = [...document.querySelectorAll<HTMLElement>("#screen-deck-detail .detail-card")];
  expect(cards.length).toBe(4);
  const first = cards[0];
  expect(first.querySelector(".chip")?.textContent).toContain("seen 1");
  expect(first.textContent).toContain("relearning");
  expect(first.classList.contains("weak")).toBe(true);

  // Start review resumes the paused session rather than restarting
  await userEvent.click(el("#screen-deck-detail .primary-btn"));
  await waitFor(() => !hidden("#screen-review"));
  expect(el("#tb-count").textContent).toBe("2/4");
});

test("stats screen shows a per-day entry and a streak after grading", async () => {
  await openDeckNamed("Hello, Zig");
  await userEvent.click(el("#card"));
  await userEvent.click(el("#btn-known"));
  await waitFor(() => el("#tb-count").textContent === "2/4");
  await userEvent.click(el("#btn-back"));
  await waitFor(() => !hidden("#screen-section"));
  await userEvent.click(el("#btn-back"));
  await waitFor(() => !hidden("#screen-home"));

  await userEvent.click(el(".footer-note [aria-label='Stats']"));
  await waitFor(() => !hidden("#screen-stats"));
  expect(hidden("#screen-home")).toBe(true);
  const text = el("#screen-stats").textContent ?? "";
  expect(text).toContain("current streak");
  expect(text).toContain("longest streak");
  expect(text).toContain("1 reviews");
  expect(count("#screen-stats .day-row")).toBe(1);
  const streakCell = document.querySelector("#screen-stats .done-stat .v");
  expect(streakCell?.textContent).toBe("1");

  await userEvent.click(el("#btn-back"));
  await waitFor(() => !hidden("#screen-home"));
});

test("stats screen shows an empty state before any reviews", async () => {
  await userEvent.click(el(".footer-note [aria-label='Stats']"));
  await waitFor(() => !hidden("#screen-stats"));
  expect(el("#screen-stats").textContent).toContain("No reviews yet");
  await userEvent.click(el("#btn-back"));
  await waitFor(() => !hidden("#screen-home"));
});

test("shuffle toggle persists and changes session ordering", async () => {
  await userEvent.click(el("#btn-settings"));
  await waitFor(() => !hidden("#screen-settings"));
  const input = el("#screen-settings input[aria-label='Shuffle cards']") as HTMLInputElement;
  expect(input.checked).toBe(false);

  // click the visible switch (the native checkbox itself is hidden)
  await userEvent.click(el("#screen-settings .switch"));
  await waitFor(() => input.checked === true);
  let stored = persisted() as { settings?: { shuffle?: boolean } };
  expect(stored.settings?.shuffle).toBe(true);

  // the setting survives a settings round-trip
  await userEvent.click(el("#btn-back"));
  await waitFor(() => !hidden("#screen-home"));
  await userEvent.click(el("#btn-settings"));
  await waitFor(() => !hidden("#screen-settings"));
  expect(
    (el("#screen-settings input[aria-label='Shuffle cards']") as HTMLInputElement).checked,
  ).toBe(true);
  await userEvent.click(el("#btn-back"));
  await waitFor(() => !hidden("#screen-home"));

  // shuffled sessions are still a permutation of the deck; retry until one run
  // differs from the natural order so the assertion never flakes on randomness.
  let sawShuffle = false;
  for (let attempt = 0; attempt < 8 && !sawShuffle; attempt++) {
    await openDeckNamed("Hello, Zig");
    const order = (persisted() as { session?: { order: number[] } }).session?.order ?? [];
    expect(order.length).toBe(4);
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
    if (!order.every((v, i) => v === i)) sawShuffle = true;
    await resetUi();
  }
  expect(sawShuffle).toBe(true);

  // restore the default so later tests are unaffected
  await userEvent.click(el("#btn-settings"));
  await waitFor(() => !hidden("#screen-settings"));
  const off = el("#screen-settings .switch");
  const offInput = el("#screen-settings input[aria-label='Shuffle cards']") as HTMLInputElement;
  await userEvent.click(off);
  await waitFor(() => offInput.checked === false);
  stored = persisted() as { settings?: { shuffle?: boolean } };
  expect(stored.settings?.shuffle).toBe(false);
  await userEvent.click(el("#btn-back"));
  await waitFor(() => !hidden("#screen-home"));
});
