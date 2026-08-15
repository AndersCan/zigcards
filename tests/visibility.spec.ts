import { beforeAll, beforeEach, expect, test } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";
import { bootstrapApp, resetUi, waitFor } from "./helpers";

// Walk every card in every deck: the front must show a clickable "Show answer",
// and after revealing, both grade buttons must be visible AND inside the
// viewport. This is the user-facing promise: "there's always something to tap."

const VIEWPORTS = [
  { width: 390, height: 844 }, // typical phone
  { width: 320, height: 568 }, // small phone
  { width: 1440, height: 900 }, // desktop
];

beforeAll(bootstrapApp);
beforeEach(resetUi);

for (const viewport of VIEWPORTS) {
  test(`grade buttons visible on every card (${viewport.width}x${viewport.height})`, async () => {
    await page.viewport(viewport.width, viewport.height);

    const totalCards = window.ZigCards.decks.reduce((n, d) => n + d.cards.length, 0);
    expect(totalCards).toBeGreaterThan(0);

    const sections = [...new Set(window.ZigCards.decks.map((d) => d.section))];
    let reviewed = 0;

    for (let s = 0; s < sections.length; s++) {
      // home picker → section card
      const sectionCards = [...document.querySelectorAll<HTMLElement>(".section-card")];
      const sectionCard = sectionCards.find(
        (c) => c.querySelector(".section-title")?.textContent === sectionTitle(sections[s]),
      );
      if (!sectionCard) throw new Error(`section card not found: ${sections[s]}`);
      await userEvent.click(sectionCard);
      await waitFor(() => !hidden("#screen-section"));

      const decksInSection = window.ZigCards.decks.filter((d) => d.section === sections[s]);
      for (let d = 0; d < decksInSection.length; d++) {
        const deckCards = decksInSection[d].cards.length;
        // rows are re-rendered by lit-html after every deck; re-query each time
        const row = document.querySelectorAll(".deck-row")[d];
        if (!row) throw new Error("deck row not found");
        await userEvent.click(row);

        for (let c = 0; c < deckCards; c++) {
          const where = `section ${s + 1}/${sections.length} deck ${d + 1}/${decksInSection.length} card ${c + 1}/${deckCards}`;

          // front: the one obvious action is the Show-answer button
          expect(document.querySelector("#card")).not.toBeNull();
          expect(
            document.querySelector("#btn-show"),
            `${where}: Show answer visible`,
          ).not.toBeNull();
          expect(
            document.querySelectorAll("#btn-known").length,
            `${where}: no grade buttons yet`,
          ).toBe(0);

          // reveal via the same button a user would tap
          const show = document.querySelector("#btn-show");
          if (!show) throw new Error(`${where}: no #btn-show`);
          await userEvent.click(show);
          expect(hidden("#card-back"), `${where}: back revealed`).toBe(false);

          // grade buttons must be visible AND fully inside the viewport
          const known = document.querySelector("#btn-known");
          const unknown = document.querySelector("#btn-unknown");
          expect(known, `${where}: Knew present`).not.toBeNull();
          expect(unknown, `${where}: Didn't know present`).not.toBeNull();
          for (const id of ["#btn-known", "#btn-unknown"]) {
            const node = document.querySelector(id);
            if (!node) throw new Error(`${where}: #${id} missing`);
            const box = (node as HTMLElement).getBoundingClientRect();
            const height = window.innerHeight;
            expect(box.width, `${where}: ${id} has a box`).toBeGreaterThan(0);
            expect(box.y, `${where}: ${id} top inside viewport`).toBeGreaterThanOrEqual(0);
            expect(
              box.y + box.height,
              `${where}: ${id} bottom inside viewport`,
            ).toBeLessThanOrEqual(height);
          }

          // grade, then wait for the next card's front or the deck-end (no fixed sleep)
          const btnKnown = document.querySelector("#btn-known");
          if (!btnKnown) throw new Error(`${where}: no #btn-known`);
          await userEvent.click(btnKnown);
          if (c === deckCards - 1) {
            await waitFor(() => !hidden("#screen-done"));
          } else {
            await waitFor(() => document.querySelector("#btn-show") !== null);
          }
          reviewed++;
        }

        // deck finished -> back to the section deck list
        const ghost = document.querySelector(".ghost-btn");
        if (!ghost) throw new Error("no .ghost-btn");
        await userEvent.click(ghost);
        await waitFor(() => !hidden("#screen-section"));
      }

      // section finished -> back to the home picker
      await userEvent.click(el("#btn-back"));
      await waitFor(() => !hidden("#screen-home"));
    }

    expect(reviewed).toBe(totalCards);
  }, 180_000);
}

function sectionTitle(id: string): string {
  switch (id) {
    case "prerequisites":
      return "Prerequisites";
    case "zig":
      return "Zig";
    case "mojo":
      return "Mojo";
    case "urdu":
      return "Urdu";
    default:
      throw new Error(`unknown section id: ${id}`);
  }
}

function hidden(selector: string): boolean {
  const node = document.querySelector(selector);
  return node === null || (node as HTMLElement).hidden === true;
}

function el(selector: string): HTMLElement {
  const node = document.querySelector(selector);
  if (!node) throw new Error(`${selector} not found`);
  return node as HTMLElement;
}
