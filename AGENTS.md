# ZigCards — Agent Guide

Mobile-first flashcard app for learning Zig, built from ziglings. Content is
data in `decks/*.ts`; correctness is enforced by tooling, not faith.

## Quality gates

`npm run ready` is the full gate CI runs: typecheck → validate → build → test.

- `npm run typecheck` — `tsc --noEmit` (strict). Fix errors before anything else.
- `npm run validate` — deck schema, unique ids, code fidelity vs ziglings
  sources, and expected-output matching. Needs a ziglings checkout:
  - local: defaults to `../ziglings` + `/tmp/healed` (run `ziglings/patches/eowyn.sh`
    or the heal loop in CI to generate healed sources)
  - override with `ZIGLINGS_DIR` / `ZIGLINGS_HEALED` env vars
- `npm run build` — esbuild bundle → `dist/app.js`
- `npm test` — Playwright e2e (`tests/e2e.spec.mjs`) + the full
  every-card visibility walk (`tests/visibility.spec.mjs`)

## Dev loop

```
npm install
npm run dev      # esbuild serve + rebuild on change → http://localhost:8000
```

## Changing content (decks)

Read `guide.md` first — it is the deck-authoring contract. Deck schema is
enforced by TypeScript (`src/types.ts`) and by `scripts/validate.mjs`.

## Recording changes

This repo uses bumpy change tracking (like mantaq). For any change, create a
bump file before committing:

```
npx bumpy add --packages "zigcards:<patch|minor|major>" \
  --message "<one-line user-facing summary>" --name "<short-kebab-name>"
```

CI requires a bump file on PRs. Update the bump file in place as the work
evolves; don't stack multiple files for the same logical change.
