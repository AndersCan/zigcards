# ZigCards Deck Authoring Guide

This guide governs how decks are written. There are three kinds of decks:

1. **Zig decks** (section `zig`): teach Zig facts, sourced from material that
   already compiles and runs. **We do not invent Zig code.** All snippets come
   from the ziglings exercise set, which is continuously compiled and tested
   against a real Zig toolchain.
2. **Mojo decks** (section `mojo`): teach Mojo facts on the same model, sourced
   from the mojo-quest exercise set (official, verified against a pinned Mojo
   compiler). **We do not invent Mojo code.**
3. **Prerequisite decks** (section `prerequisites`): original memory/foundations
   content for developers coming from managed languages (e.g. JavaScript). These
   are **concept-only**: no language code, no invented outputs, correctness by
   careful authoring + review.

---

## 1. Content source

The canonical source is the **ziglings** exercise repository:

- Repo: `https://codeberg.org/ziglings/exercises` (cloned to `../ziglings`)
- Pinned toolchain: the version required by `ziglings/build.zig` (currently
  `0.17.0-dev.607` or higher). Content assumes that version's semantics.
- The exercises are ordered 001 → 116 in a deliberate teaching sequence. That
  order **is** our curriculum. Our decks map to that sequence; we do not
  reorder or re-scope it.

Three artifacts are authoritative and must be used as-is:

| Artifact         | Path                                                                    | Use                                                           |
| ---------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| Broken exercises | `ziglings/exercises/NNN_name.zig`                                       | The `code` shown on **fix** card fronts                       |
| Solved exercises | `ziglings/patches/healed/` (or apply `patches/patches/NNN.patch`)       | The `code`/`backCode` for **output** cards and fix-card backs |
| Expected output  | `rivendell/elrond.zig`, `const exercises = ...` block (`.output` field) | The **exact** answer for **output** cards                     |

Every card MUST carry a `source` field citing the exercise, e.g. `ziglings 009_if`.

### Mojo decks — source

The canonical source is the **mojo-quest** exercise repository:

- Repo: `https://github.com/modular/mojo-quest` (cloned to `../mojo-quest`)
- Pinned toolchain: a **stable** Mojo release (not `mojo_nightly`), pinned by
  mojo-quest's `verify:exercises` script
- The tickets are ordered MQ-101 → MQ-951 in a deliberate teaching sequence
  (MQ-1xx basics/functions, 2xx variables/types/collections, 3xx operators &
  control flow, 4xx errors & context managers, 5xx structs & modules, 6xx value
  ownership, 7xx value lifecycle, 8xx metaprogramming, 9xx pointers/testing).
  That order **is** our curriculum. Our deck maps to that sequence.

Two artifacts are authoritative and must be used as-is:

| Artifact        | Path                                                | Use                                                        |
| --------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| Solved sources  | `mojo-quest/exercises/MQ_NNN.mojo`                  | The `code`/`backCode` for **output** and **concept** cards |
| Expected output | `mojo-quest/src/data/issues.ts` (`.expectedStdout`) | The **exact** answer for **output** cards                  |

The `# Mojo concept:` comment atop each solved source names the single teaching
point, and `issues.ts` carries the expected output and the broken `starter`
code (the analog of ziglings' broken exercises). The expected-output key is
vendored at `scripts/data/mojo-quest-outputs.json`. Every card MUST carry a
`source` field citing the ticket, e.g. `source: "mojo-quest MQ-101"`.

## 2. Deck file format

Each deck is a typed ES module in `decks/` exporting one `Deck` object. It is
bundled into the app via `src/main.ts` (which imports every deck in teaching
order):

```ts
// decks/03-control-flow.ts
import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "control-flow",          // kebab-case, stable
  title: "Control Flow",       // human-readable
  order: 3,                    // teaching order (matches ziglings bands)
  blurb: "if, while, for",     // one-line subtitle
  cards: [
    { ...card... },
  ],
};

export default deck;
```

Register a new deck by adding an import + entry in `src/main.ts`. The deck's
`order` field is what the home screen sorts by within its section. Every deck
also carries `section`: `"zig"` for the ziglings-derived curriculum,
`"mojo"` for the mojo-quest-derived curriculum, or `"prerequisites"` for the
memory/foundations decks. Mojo decks set `language: "mojo"` so code blocks are
highlighted with the Python grammar (Mojo is Python-superset); Zig decks omit
`language` (defaults to `"zig"`). The `Card` type is defined
in `src/types.ts`; `npm run typecheck` enforces the schema.

## 2b. Prerequisite decks (section `prerequisites`)

These decks fill the knowledge gap for developers who came to Zig from a
language that hid memory management (10 years of JavaScript, say): what an
address is, stack vs heap, values vs references, what a GC does. Rules:

1. **Concept cards only.** `type: "concept"` — no `output` (no answer key to
   verify against) and no `fix` (that type exists to teach compile errors).
2. **No language code.** `code`/`backCode` must be absent. Inline identifiers in
   `front`/`back`/`explanation` (`` `u8` ``, `` `&num` ``, `` `var` ``) are fine.
3. **Source convention.** `source` must start with `prereq ` and name the deck
   topic, e.g. `source: "prereq memory-basics"`. There is no external artifact
   to byte-check against — correctness is the author's responsibility.
4. **Bridge, don't lecture.** These decks exist to translate what a JS/GC
   developer already knows (references, `let b = a` for objects) into the
   explicit memory model Zig exposes (addresses, `&`, `.*`).
5. **Flashcard-sized** like all cards: front ≤ ~20 words, back ≤ ~40 words,
   `explanation` ≤ ~3 sentences.

## 3. Card schema

```js
{
  id: "cf-011",                 // unique within the deck (prefix with a short deck code)
  source: "ziglings 011_while", // REQUIRED provenance
  type: "output" | "fix" | "concept",
  front: "What does this program print?",  // ALWAYS a question
  code: `...`,                  // Zig snippet shown on the front (optional)
  back: "The direct answer.",   // answers the front question FIRST
  backCode: `...`,              // optional snippet shown on the back (e.g. the fix)
  explanation: "Why. The reasoning, one or two sentences.",  // optional but encouraged
}
```

### Card types — when to use each

- **output** — "What does this print / what happens when this runs?"
  Code is the **solved** program (from healed/). Answer is the **exact** output
  from the elrond answer key, or the observed behavior ("it panics: …").
  Use these for most exercises: prediction is the strongest recall exercise.
- **fix** — "Why doesn't this compile?" Code is the **broken** program
  (verbatim from `exercises/`). Answer names the missing/incorrect piece and
  the concept. `backCode` shows the fixed snippet (verbatim from healed/).
  Use when the exercise's teaching point IS the error (e.g. 009_if: `if` only
  accepts bool; 001_hello: `pub fn main`).
- **concept** — short Q&A distilled from the exercise's teaching comments.
  No code (or tiny supporting snippet). Use sparingly; prefer output/fix.

### Rules (non-negotiable)

1. **No invented code.** Every snippet is copied from the exercise or healed
   files (ziglings), or from the mojo-quest solved sources. You may _trim_ a
   snippet to the relevant lines, but never alter, repair, or extend the code.
   If the exercise code must be shown intact to stay meaningful, show it intact.
2. **Exact outputs.** `output`-type answers quote the answer key exactly —
   the ziglings elrond key or the mojo-quest `expectedStdout` — including
   spaces and punctuation. Do not paraphrase an output.
3. **One teaching point per card.** If an exercise teaches two things, use two
   cards.
4. **Front is a question.** "What does this print?", "Why doesn't this
   compile?", "What keyword …?", "What does `orelse` do?" — never a statement.
5. **Answer first, then reasoning.** `back` is the direct answer. `explanation`
   is the why. Do not bury the answer.
6. **Flashcard-sized.** Front ≤ ~20 words + code. Back ≤ ~40 words.
   `explanation` ≤ ~3 sentences. Density kills retention.
7. **Quote compiler messages only when certain.** ziglings comments sometimes
   quote the exact message (e.g. "cannot assign to constant"). Prefer
   describing the error ("a compile error: `u8` cannot hold 300") over
   fabricating exact message text.
8. **Cite your source.** Every card carries `source`.

## 4. Converting an exercise → cards (recipe)

1. Read `exercises/NNN_name.zig` (teaching comment + broken code).
2. Read the healed version to learn the intended fix.
3. Look up the expected output in the elrond `.output` field.
4. Pick the exercise's single teaching point.
5. Emit 1–2 cards:
   - Usually: one **fix** card (broken code → "why doesn't it compile" → fix)
     OR one **output** card (healed code → "what does it print" → exact output).
   - Add a **concept** card only if the teaching comment teaches something that
     a code card can't test.
6. Self-verify against the checklist below.

### Worked example — 009_if

Exercise: `if (foo)` is illegal because `foo` is an integer; `if` only accepts
`bool`. Fix: `if (foo == 42)`. Output: `Foo is 42!`.

Card A (fix):

```js
{
  id: "cf-001",
  source: "ziglings 009_if",
  type: "fix",
  front: "Why doesn't this compile?",
  code: `// ...healed except the condition is broken...
pub fn main() void {
    const foo = 42;
    if (foo) { ... }
}`,
  back: "`if` only accepts `bool`. `foo` is a `comptime_int`, so `if (foo)` is a type error — use a comparison: `if (foo == 42)`.",
  backCode: `if (foo == 42) { ... }`,
}
```

Card B (output, if you want a second card):

```js
{
  id: "cf-002",
  source: "ziglings 009_if",
  type: "output",
  front: "What does this print?",
  code: `const std = @import("std");

pub fn main() void {
    const foo = 42;
    if (foo == 42) {
        std.debug.print("Foo is 42!\n", .{});
    } else {
        std.debug.print("Foo is not 42!\n", .{});
    }
}`,
  back: "`Foo is 42!`",
  explanation: "The condition `foo == 42` is true, so the first branch runs.",
}
```

## 5. Zig semantics cheat-sheet (ziglings toolchain)

Card authors must write answers that match these facts. When in doubt, check
the exercise or the Zig Language Reference before writing.

- **const / var**: `const` bindings are immutable (reassigning = compile error
  "cannot assign to constant"). `var` for mutation. Function **parameters are
  always const**.
- **Types**: `comptime_int`/`comptime_float` are the types of untyped literals
  and coerce to any int/float that can represent them. Implicit **narrowing**
  (u32 → u8) is a compile error; implicit **widening** (u8 → u16) is allowed in
  modern Zig (0.15+). Non-void statements must not be discarded.
- **No shadowing** of outer-scope identifiers; **no implicit return** — every
  returned value needs `return` (or `break` from a labeled block).
- **if / while / for / switch** are expressions. `if`/`switch` used as values
  are fine when the result type is a runtime type; a `comptime_int` result
  depending on a runtime condition is a compile error.
- **Booleans**: keywords `and`, `or`, `not` — not `&&`, `||`, `!`.
- **switch** must be exhaustive (handle every enum case, or include `else`).
  `switch` works on errors and enums too.
- **while** supports a continue expression: `while (cond) : (i += 1)`.
  `while`/`for` can carry `else` (runs on normal exit, not on `break`).
  `break` accepts a value: `break :label value`.
- **for** iterates arrays/slices/ranges. Index: `for (items, 0..) |item, i|`.
  Range: `for (0..5) |i|`. Multi-object: `for (a, b) |x, y|`. Capture by
  reference with `|*p|` (mutate via `p.*`). Sentinel access: `items.len`.
- **defer** runs at scope exit, **reverse order** (last declared runs first).
  `errdefer` runs only when the scope returns an error.
- **Optionals** `?T`: `null` is the empty value; `orelse` gives a default;
  `if (opt) |v| … else …` unwraps safely; `opt.?` unwraps and **panics**
  ("attempt to use null value") on null. Values coerce _into_ optionals
  implicitly; unwrapping never is.
- **Error unions** `!T`: `try` unwraps (propagates errors), `catch` handles
  (`x catch 0`, or `catch |err| …`), `if (eu) |v| … else |err|` handles both
  (the `else |err|` is required for error unions). `error.SetName` and
  `anyerror`. `switch` over errors with `else`.
- **Panics** (Debug build, the default for `zig run`): integer overflow,
  division by zero, out-of-bounds index, unwrap-null, unwrap-error, reaching
  `unreachable`. Zig is safety-checked by default.
- **Printing**: `std.debug.print` writes to **stderr** (we treat it as "the
  program's output"). `{d}` integer decimal, `{s}` string, `{}` default,
  `{?s}` optional string, `{!}` error union, `{x}`/`{b}`/`{o}` bases.

## 5b. Mojo semantics cheat-sheet (mojo-quest toolchain)

Card authors must write answers that match these facts. When in doubt, check
the solved exercise or the Mojo Manual before writing.

- **`def` vs `var`**: `def` defines functions; `var` declares mutable
  variables. `alias` and `comptime` declare compile-time constants.
- **Types**: parameters and return types are annotated (`name: Int`,
  `-> Int`); variables are strongly typed, so assigning a different type is a
  compile error. No automatic narrowing/widening across numeric operators —
  convert explicitly (`Float64(x)`).
- **Code blocks** use Python-style indentation after a `:` — no braces.
- **Functions**: keyword arguments (`name=value`), defaults after required
  args, keyword-only args after a single `*`, variadic `*args`. Functions can
  be overloaded by argument types. `pass` is a no-op placeholder.
- **Errors**: functions are non-raising by default; `raises` opts into error
  propagation. `raise Error("...")` raises; `try`/`except` handles; re-raise
  with `raise e^`. `with` manages resources (context managers release on block
  exit, errors included).
- **Operators**: `**` exponent, `//` floor division, `%` remainder, `in`
  membership, chained comparisons (`a < b < c`), `and`/`or` short-circuit.
  Compound assignment (`*=` etc.) updates in place.
- **Collections**: `List[T]` (one type per list, `list[i]`, `append`, `len`),
  `Tuple` (indexed `t[0]`), `Dict[K, V]`, `Set[T]` (unique), `Optional[T]`
  (test with `if`, read with `.value()`). `for` iterates collections and
  `range(start, stop, step)`; `for ref r in items` mutates in place.
- **Structs**: fields declared `var field: Type`, initialized in `__init__`.
  Methods take `self`; `mut self` to mutate. `@staticmethod`, `@fieldwise_init`,
  `@implicit`. Dunder methods overload operators: `__add__`, `__neg__`,
  `__eq__`, `__getitem__`, `__del__`. Traits (`Sensor`, `Sized`, `Copyable`,
  `Movable`, `ImplicitlyCopyable`) are declared after the struct name.
- **Ownership**: a variable owns its value; the `^` sigil transfers ownership
  (leaving the source uninitialized). `ref` binds a reference. `mut` arguments
  write back to the caller. `Copyable`/`ImplicitlyCopyable` control copying.
  `__del__` runs at last use (ASAP destruction).
- **Metaprogramming**: parameters in `[]` are compile-time; `comptime`
  evaluates expressions/loops/asserts at compile time; `reflect[T]` inspects
  types; `Some[Trait]` is generic shorthand.
- **Pointers & testing**: `alloc[T](n)` / `ptr.free()` for heap memory;
  `assert_equal` and `assert_raises` from `std.testing` for tests.

## 6. Verification checklist (run for every card)

- [ ] `code` / `backCode` are byte-faithful copies from `exercises/` or healed/
- [ ] `source` cites the correct exercise
- [ ] For `output` cards, `back` matches the elrond answer key exactly
- [ ] For `fix` cards, the described error and fix match the healed version
- [ ] One teaching point; front is a question; answer comes first
- [ ] `id` is unique across the deck; deck `order` is correct
- [ ] JS is valid (no stray backticks inside template literals — escape `\n`
      inside Zig string literals as `\\n`)

## 7. Review process

Decks are reviewed before being accepted:

1. **Schema + syntax check** (scripted): all fields present, ids unique, JS parses.
2. **Content review** (human/agent): spot-check `code` against the source
   files, `back` outputs against the answer key, and teaching points against
   this guide.
3. **Toolchain gate** (the real one): whenever a Zig toolchain is available,
   compile and run every unique snippet. Snippets that fail are rejected, not
   repaired — the source exercises are already verified, so any failure means
   the snippet was mangled in transcription.
