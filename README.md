# ZigCards

Flashcards for learning Zig and Mojo, built from the
[ziglings](https://codeberg.org/ziglings/exercises) and
[mojo-quest](https://github.com/modular/mojo-quest) exercise sets. Mobile-first,
dark, thumb-friendly, works offline.

**Try it live:** <https://anderscan.github.io/zigcards/>

**The content is not invented.** Every deck card is grounded in a specific
exercise (cite it in the `source` field — `ziglings NNN_*` or
`mojo-quest MQ-NNN`). Code snippets are copied verbatim from the exercise
sources, and every expected output is checked against the exercise sets' own
answer keys (see `scripts/validate.mjs`). The Prerequisites section is original
content, clearly separated on the home screen and credited in the app's
acknowledgements page.

## Quick start

```sh
vp install
vp dev        # Vite dev server → http://localhost:8000
```

For a plain static build (works from any static file server):

```sh
vp build      # Vite (Rolldown) build → dist/
vp preview
```

## Tests

```sh
vp check           # oxfmt format + oxlint + type-check (strict)
vp run validate    # deck schema, source fidelity, and answer-key checks
vp test            # Vitest browser-mode e2e (real Chromium, mobile viewport)
vp run ready       # the full CI gate: check + validate + build + test
```

CI (`.github/workflows/ci.yml`) runs `vp run ready` on push/PR to `main`,
cloning ziglings and mojo-quest to verify card content. Changes are tracked
with [`bumpy`](https://bumpy.varlock.dev) bump files (`.bumpy/`) and required
on PRs. Run `vp exec playwright install chromium` once before the first local
test run.

## Project layout

```
guide.md          Deck-authoring contract (READ before writing content)
vite.config.ts    Vite+ toolchain config (dev/build/test/lint/fmt/hooks)
src/types.ts      Shared types (Deck, Card)
src/app.ts        App UI (lit-html templates)
src/machine/      Review engine: mantaq state machine, SM-2 SRS scheduling,
                  session queues, progress + day history, localStorage
                  persistence (src/machine/*.ts)
src/main.ts       Entry point; registers the decks
src/globals.d.ts  window.ZigCards + prism component declarations
decks/*.ts        Deck data modules (typed ES modules, one per teaching band)
scripts/validate.mjs  Schema + fidelity + output checks against ziglings/mojo-quest
css/app.css       Styles (dark, mobile-first; Prism token colors)
tests/e2e.spec.ts     Vitest browser e2e (real Chromium)
tests/visibility.spec.ts  Every-card visibility walk (3 viewports)
```

TypeScript is type-checked by `vp check` (tsgolint, TypeScript 7) and
transpiled by Vite — no separate emit step.

## Decks

| #   | Section       | Deck                            | Content                            |
| --- | ------------- | ------------------------------- | ---------------------------------- |
| 0   | Prerequisites | Memory basics                   | bits, bytes, addresses, references |
| 0   | Prerequisites | Stack & heap                    | call frames, lifetimes, the GC     |
| 1   | Zig           | Hello, Zig                      | ziglings 001–002                   |
| 2   | Zig           | Values: types, arrays, strings  | ziglings 003–008                   |
| 3   | Zig           | Control Flow                    | ziglings 009–017                   |
| 4   | Zig           | Functions                       | ziglings 018–020                   |
| 5   | Zig           | Errors & defer                  | ziglings 021–029                   |
| 6   | Zig           | switch, unreachable, if-error   | ziglings 030–034                   |
| 7   | Zig           | Enums & structs                 | ziglings 035–038                   |
| 8   | Zig           | Pointers                        | ziglings 039–044                   |
| 9   | Zig           | Optionals                       | ziglings 045–046                   |
| 1   | Mojo          | Mojo: basics & functions        | mojo-quest MQ-1xx                  |
| 2   | Mojo          | Mojo: variables & collections   | mojo-quest MQ-2xx                  |
| 3   | Mojo          | Mojo: operators & control flow  | mojo-quest MQ-3xx                  |
| 4   | Mojo          | Mojo: errors & context managers | mojo-quest MQ-4xx                  |
| 5   | Mojo          | Mojo: structs & modules         | mojo-quest MQ-5xx                  |
| 6   | Mojo          | Mojo: value ownership           | mojo-quest MQ-6xx                  |
| 7   | Mojo          | Mojo: value lifecycle           | mojo-quest MQ-7xx                  |
| 8   | Mojo          | Mojo: metaprogramming           | mojo-quest MQ-8xx                  |
| 9   | Mojo          | Mojo: pointers & testing        | mojo-quest MQ-9xx                  |

The **Prerequisites** section is original memory/foundations content written
for this app — the parts a JavaScript developer never had to think about. The
**Zig** section is built from the ziglings exercise sequence; the **Mojo**
section is built from the mojo-quest exercise sequence; the app's "Thanks &
acknowledgements" page credits ziglings, mojo-quest, and their authors.

Content targets the Zig version required by `ziglings/build.zig` (currently a
`0.17.0-dev` build). The expected outputs in the answer key and the healed
exercise sources were generated from the current ziglings main branch.

## Adding a deck

1. Read `guide.md` — it is the contract.
2. Add `decks/NN-name.ts` (an ES module exporting a deck object).
3. Register it in `src/main.ts`.
4. Run `vp run validate` — every card must pass schema, source-fidelity, and
   expected-output checks before it ships.

## Validation

```sh
vp run validate
```

Checks: required card fields, valid types, unique ids, valid `section`, and —
for `zig` decks — `source` files exist, every code/backCode line exists in the
exercise source, and every `output`-type card's answer matches the ziglings
answer key. `mojo` decks get the same treatment against a mojo-quest checkout
and its answer key. `prerequisites` decks are schema-checked plus must be
concept-only (`prereq `-prefixed `source`, no `code`/`backCode`).

The ziglings and mojo-quest sources are not vendored; point at checkouts via
`ZIGLINGS_DIR`/`ZIGLINGS_HEALED` and `MOJO_QUEST_DIR` (defaults: `../ziglings`,
`/tmp/healed`, `../mojo-quest`).

## Review engine

- **Spaced repetition (SM-2 flavored).** Grading a card "known" schedules the
  next review: 1 day, then 3 days, then ~`interval × ease` (ease starts at
  2.5, ±0.1 per grade, floor 1.3), capped at 365 days. Grading "unknown"
  schedules a 1-day relearning pass and counts a lapse.
- **Due-based sessions.** A session queue is built at open time from new +
  due cards, in deck order unless shuffle is enabled in settings. Skipping a
  card re-queues it to the end; backing out pauses the session, and opening
  the deck later resumes it.
- **Review missed.** Unknown cards are collected per session; the done screen
  offers a "Review missed" drill-down.
- **Progress & stats.** Per-card progress (seen/known/unknown, last review,
  due date, state) drives deck-detail views and home badges; per-day history
  feeds streaks and the stats screen.

## Scope notes (current phase)

- Review UI + core deck content only.
- The grading/feedback loop and multi-agent content pipeline from the original
  product spec are intentionally out of scope for this build.

## License

Card content derives from ziglings (MIT), which is in turn
[CC-BY-SA-3.0](https://github.com/ratfactor/ziglings#license)-licensed content
plus original material, and from mojo-quest
([Apache License v2.0 with LLVM Exceptions](https://llvm.org/LICENSE.txt)).
See `../ziglings/LICENSE` and `../mojo-quest`.
