import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("home lists all 9 decks", async ({ page }) => {
  const rows = page.locator(".deck-row");
  await expect(rows).toHaveCount(9);
  await expect(page.locator("#tb-title")).toHaveText("ZigCards");
});

test("starting a deck shows the first card and progress", async ({ page }) => {
  await page.locator(".deck-row").first().click();
  await expect(page.locator("#card")).toBeVisible();
  await expect(page.locator("#tb-count")).toHaveText("1/4");
  await expect(page.locator(".card-type")).toHaveText("fix this");
  // front state: a clear "Show answer" action, no grade buttons yet
  await expect(page.locator("#btn-show")).toBeVisible();
  await expect(page.locator("#btn-known")).toHaveCount(0);
  await expect(page.locator("#btn-unknown")).toHaveCount(0);
  // only the review screen is visible
  await expect(page.locator("#screen-home")).toBeHidden();
});

test("flip reveals the back, then grading advances", async ({ page }) => {
  await page.locator(".deck-row").first().click();
  await page.locator("#card").click();
  await expect(page.locator("#card-back")).toBeVisible();
  // grade buttons replace the Show-answer button and are on-screen
  await expect(page.locator("#btn-known")).toBeVisible();
  await expect(page.locator("#btn-unknown")).toBeVisible();
  await expect(page.locator("#btn-show")).toHaveCount(0);

  const knownBox = await page.locator("#btn-known").boundingBox();
  expect(knownBox).not.toBeNull();
  expect(knownBox.y + knownBox.height).toBeLessThanOrEqual(844);

  await page.locator("#btn-known").click();
  await expect(page.locator("#tb-count")).toHaveText("2/4");
});

test("swipe right grades as known", async ({ page }) => {
  await page.locator(".deck-row").first().click();
  await page.locator("#card").click();
  const card = page.locator("#card");
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 160, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(page.locator("#tb-count")).toHaveText("2/4");
});

test("keyboard: space flips, arrow right grades", async ({ page }) => {
  await page.locator(".deck-row").first().click();
  await page.keyboard.press("Space");
  await expect(page.locator("#card-back")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#tb-count")).toHaveText("2/4");
});

test("completing a session shows results and persists progress", async ({ page }) => {
  await page.locator(".deck-row").first().click();
  const total = 4;
  for (let i = 0; i < total; i++) {
    const back = page.locator("#card-back");
    if (!(await back.isVisible())) {
      await page.locator("#card").click();
    }
    // alternate known/unknown to exercise both grade paths
    const btn = i % 2 === 0 ? "#btn-known" : "#btn-unknown";
    await page.locator(btn).click();
    await page.waitForTimeout(280);
  }
  await expect(page.locator("#screen-done")).toBeVisible();
  await expect(page.locator("#screen-done h2")).toHaveText("Session complete");

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("zigcards.v1")));
  expect(stored.stats.reviews).toBe(total);

  // back to decks; deck shows a progress badge
  await page.locator(".ghost-btn").click();
  await expect(page.locator("#screen-home")).toBeVisible();
  await expect(page.locator(".deck-row .badge").first()).not.toHaveText("new");
});

test("back button returns home mid-session", async ({ page }) => {
  await page.locator(".deck-row").first().click();
  await page.locator("#btn-back").click();
  await expect(page.locator("#screen-home")).toBeVisible();
});

test("code blocks are highlighted by prism (token spans present)", async ({ page }) => {
  await page.locator(".deck-row").first().click();
  const tokens = page.locator("pre.code .token");
  await expect(tokens.first()).toBeVisible();
});
