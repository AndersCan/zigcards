# ZigCards — Agent Guide

Mobile-first flashcard app for learning Zig, built from ziglings. Content is
data in `decks/*.ts`; correctness is enforced by tooling, not faith.

## Domain vocabulary

The app's domain language is defined in `VOCABULARY.md` (Section → Deck →
Card, plus the mantaq event names). Use those exact terms in code, decks, UI,
and docs.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## Quality gates

`vp run ready` is the full gate CI runs: check → validate → build → test.

- `vp check` — oxfmt format + oxlint + tsgolint type-check (strict, `typeCheck` enabled). Fix errors before anything else.
- `vp run validate` — deck schema, unique ids, code fidelity vs ziglings
  sources, and expected-output matching. Needs a ziglings checkout:
  - local: defaults to `../ziglings` + `/tmp/healed` (run `ziglings/patches/eowyn.sh`
    or the heal loop in CI to generate healed sources)
  - override with `ZIGLINGS_DIR` / `ZIGLINGS_HEALED` env vars
- `vp build` — Vite (Rolldown) production build → `dist/`
- `vp test` — Vitest browser mode (real Chromium via the Playwright provider):
  e2e (`tests/e2e.spec.ts`) + the full every-card visibility walk
  (`tests/visibility.spec.ts`). Needs `vp exec playwright install chromium`
  once locally.

## Dev loop

```
vp install
vp dev      # Vite dev server → http://localhost:8000
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
