import { test, expect } from "@playwright/test";

// Walk every card in every deck: the front must show a clickable "Show answer",
// and after revealing, both grade buttons must be isVisible() AND inside the
// viewport. This is the user-facing promise: "there's always something to tap."
// Uses wait-based transitions (no fixed sleeps) so it stays fast and deterministic.

const VIEWPORTS = [
  { width: 390, height: 844 }, // typical phone
  { width: 320, height: 568 }, // small phone
  { width: 1440, height: 900 }, // desktop
];

for (const viewport of VIEWPORTS) {
  test(`grade buttons visible on every card (${viewport.width}x${viewport.height})`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const totalCards = await page.evaluate(
      () => ZigCards.decks.reduce((n, d) => n + d.cards.length, 0)
    );
    expect(totalCards).toBeGreaterThan(0);

    const rows = page.locator(".deck-row");
    const deckCount = await rows.count();
    let reviewed = 0;

    for (let d = 0; d < deckCount; d++) {
      const deckCards = await page.evaluate((i) => ZigCards.decks[i].cards.length, d);
      await rows.nth(d).click();

      for (let c = 0; c < deckCards; c++) {
        const where = `deck ${d} (${d + 1}/${deckCount}) card ${c + 1}/${deckCards}`;

        // front: the one obvious action is the Show-answer button
        await expect(page.locator("#card")).toBeVisible();
        expect(await page.locator("#btn-show").isVisible(), `${where}: Show answer visible`).toBe(
          true
        );
        expect(await page.locator("#btn-known").count(), `${where}: no grade buttons yet`).toBe(0);

        // reveal via the same button a user would tap
        await page.locator("#btn-show").click();
        await expect(page.locator("#card-back")).toBeVisible();

        // grade buttons must be visible AND fully inside the viewport
        expect(await page.locator("#btn-known").isVisible(), `${where}: Knew visible`).toBe(true);
        expect(
          await page.locator("#btn-unknown").isVisible(),
          `${where}: Didn't know visible`
        ).toBe(true);
        for (const id of ["#btn-known", "#btn-unknown"]) {
          const box = await page.locator(id).boundingBox();
          expect(box, `${where}: ${id} has a box`).not.toBeNull();
          expect(box.y, `${where}: ${id} top inside viewport`).toBeGreaterThanOrEqual(0);
          expect(
            box.y + box.height,
            `${where}: ${id} bottom inside viewport`
          ).toBeLessThanOrEqual(viewport.height);
        }

        // grade, then wait for the next card's front or the deck-end (no fixed sleep)
        await page.locator("#btn-known").click();
        if (c === deckCards - 1) {
          await expect(page.locator("#screen-done")).toBeVisible();
        } else {
          await expect(page.locator("#btn-show")).toBeVisible();
        }
        reviewed++;
      }

      // deck finished -> back to decks (done screen already asserted per last card)
      await page.locator(".ghost-btn").click();
      await expect(page.locator("#screen-home")).toBeVisible();
    }

    expect(reviewed).toBe(totalCards);
  });
}
