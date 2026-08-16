# Vocabulary — the app's domain language

Short list of the terms that define things in the app. Naming here is the
source of truth: use these exact terms in code, decks, UI, and docs.

## Things

- **Section** — top-level grouping; one curriculum or language area
  (`prerequisites`, `zig`, `mojo`, `urdu`). Source: `src/sections.ts`.
- **Deck** — a named, ordered set of cards within a section (`decks/*.ts`).
- **Card** — one prompt/answer pair; belongs to a deck.
- **Card type** — how a card is answered: `output` | `fix` | `concept`.
- **Session** — one run through a deck while reviewing.
- **Grade** — the learner's judgment on a card: known / unknown.
- **Progress** — per-card known/unknown state, persisted per deck.
- **Stats** — aggregated learner numbers (sessions, reviews, known, unknown).
- **Settings** — learner preferences (`CodeSettings`: code size, print width,
  shuffle).

## Events (mantaq)

Past-tense names of what happened; `inputs` in `src/machine/refs.ts`:

- `OPEN_SECTION` · `OPEN_DECK` · `OPEN_DECK_DETAIL` — navigation
- `FLIP` · `GRADE` · `SKIP` — reviewing
- `BACK_TO_HOME` · `RESTART_DECK` · `DRILL_MISSED` · `RESET_PROGRESS` · `RESET`
- `OPEN_STATS` · `OPEN_SETTINGS` · `CLOSE_SETTINGS` · `UPDATE_SETTINGS` · `OPEN_CREDITS`
- `GRADE_DONE` — internal only
