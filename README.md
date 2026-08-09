# ZigCards

Flashcards for learning Zig, built from the [ziglings](https://codeberg.org/ziglings/exercises)
exercise set. Mobile-first, dark, thumb-friendly, works offline.

**The content is not invented.** Every card is grounded in a specific ziglings
exercise (cite it in the `source` field). Code snippets are copied verbatim
from the exercises, and every expected output is checked against ziglings'
own answer key (see `scripts/validate.mjs`).

## Quick start

```sh
npm install
npm run dev        # builds + serves at http://localhost:8000
```

For a plain static build (works from any static file server):

```sh
npm run build      # -> dist/app.js
python3 -m http.server 8000
```

## Tests

```sh
npm run typecheck  # tsc --noEmit (strict)
npm run validate   # deck schema, source fidelity, and answer-key checks
npm test           # Playwright end-to-end tests (real Chromium, mobile viewport)
npm run ready      # the full CI gate: typecheck + validate + build + test
```

CI (`.github/workflows/ci.yml`) runs `npm run ready` on push/PR to `main`,
cloning ziglings to verify card content. Changes are tracked with
[`bumpy`](https://bumpy.varlock.dev) bump files (`.bumpy/`) and required on PRs.
Run `npx playwright install chromium` once before the first local test run.

## Project layout

```
guide.md          Deck-authoring contract (READ before writing content)
src/types.ts      Shared types (Deck, Card)
src/app.ts        App UI (lit-html templates) + review logic
src/store.ts      Local progress store (localStorage)
src/main.ts       Entry point; registers the decks
src/globals.d.ts  window.ZigCards + prism component declarations
decks/*.ts        Deck data modules (typed ES modules, one per teaching band)
scripts/validate.mjs  Schema + fidelity + output checks against ziglings
css/app.css       Styles (dark, mobile-first; Prism token colors)
```

TypeScript is transpiled by esbuild (no separate emit step); `npm run typecheck`
runs `tsc --noEmit` for type safety.

## Decks

| # | Deck | ziglings exercises |
| - | ---- | ------------------ |
| 1 | Hello, Zig | 001–002 |
| 2 | Values: types, arrays, strings | 003–008 |
| 3 | Control Flow | 009–017 |
| 4 | Functions | 018–020 |
| 5 | Errors & defer | 021–029 |
| 6 | switch, unreachable, if-error | 030–034 |
| 7 | Enums & structs | 035–038 |
| 8 | Pointers | 039–044 |
| 9 | Optionals | 045–046 |

Content targets the Zig version required by `ziglings/build.zig` (currently a
`0.17.0-dev` build). The expected outputs in the answer key and the healed
exercise sources were generated from the current ziglings main branch.

## Adding a deck

1. Read `guide.md` — it is the contract.
2. Add `decks/NN-name.js` (an ES module exporting a deck object).
3. Register it in `src/main.js`.
4. Run `npm run validate` — every card must pass schema, source-fidelity, and
   expected-output checks before it ships.

## Validation

```sh
npm run validate
```

Checks: required card fields, valid types, unique ids, `source` files exist,
every code/backCode line exists in the exercise source, and every
`output`-type card's answer matches the ziglings answer key.

## Scope notes (current phase)
- Review UI + core deck content only.
- **No SRS scheduler yet** — sessions are deck-ordered; know/didn't-know
  grading only updates per-card progress and session stats. Scheduling (SM-2
  or FSRS) is a later phase.
- The grading/feedback loop and multi-agent content pipeline from the original
  product spec are intentionally out of scope for this build.

## License

Card content derives from ziglings (MIT), which is in turn
[CC-BY-SA-3.0](https://github.com/ratfactor/ziglings#license)-licensed content
plus original material. See `../ziglings/LICENSE`.
