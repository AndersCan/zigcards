import "../css/app.css";
import indexHtml from "../index.html?raw";
import { page, userEvent } from "vite-plus/test/browser";

let booted = false;

function shellBody(): string {
  const body = indexHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return (body?.[1] ?? "").replace(/<script[\s\S]*?<\/script>/g, "");
}

/* Boot the real app into the test document (once per test file). The DOM
   shell from index.html is injected first because src/app.ts looks up its
   elements at module load. */
export async function bootstrapApp(): Promise<void> {
  if (booted) return;
  document.body.innerHTML = shellBody();
  await import("../src/main.ts");
  booted = true;
}

/* Per-test reset: fresh progress + a clean home screen, driven through the
   machine's RESET event (which also clears progress and persists the wipe). */
export async function resetUi(): Promise<void> {
  const { resetToHome } = await import("../src/app.ts");
  resetToHome();
  await page.viewport(390, 844);
  await userEvent.unhover(document.body);
}

/* Poll a DOM condition instead of sleeping on fixed animation timers. */
export async function waitFor(fn: () => boolean, timeout = 5000): Promise<void> {
  const start = Date.now();
  while (!fn()) {
    if (Date.now() - start > timeout) {
      throw new Error("waitFor: condition not met before timeout");
    }
    await new Promise((r) => setTimeout(r, 25));
  }
}
