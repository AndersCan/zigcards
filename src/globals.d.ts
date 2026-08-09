import type { Deck } from "./types.ts";

declare global {
  interface Window {
    ZigCards: { decks: Deck[] };
  }
}

declare module "prismjs/components/*";
