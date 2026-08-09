import type { BrowserCommand } from "vite-plus/test/node";

/* Real pointer drag through the Playwright provider: the app listens for
   pointer events on #card, so the swipe must come from the browser driver
   (mouse events synthesize pointer events in Chromium), not synthetic
   dispatchEvent calls (setPointerCapture would reject an inactive pointer). */
export const swipe: BrowserCommand<[selector: string, dx: number]> = async (ctx, selector, dx) => {
  if (ctx.provider.name !== "playwright") {
    throw new Error("swipe command requires the playwright provider");
  }
  const frame = await ctx.frame();
  const box = await frame.locator(selector).boundingBox();
  if (!box) throw new Error(`swipe: ${selector} has no bounding box`);

  const frameBox = await (await frame.frameElement()).boundingBox();
  const page = frame.page();
  const x = (frameBox?.x ?? 0) + box.x + box.width / 2;
  const y = (frameBox?.y ?? 0) + box.y + box.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y, { steps: 10 });
  await page.mouse.up();
};
