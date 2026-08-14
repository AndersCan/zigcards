import type { Deck } from "../src/types.ts";

// The Mojo curriculum, split into teaching bands following mojo-quest's
// ordering. Code snippets are byte-faithful copies from mojo-quest
// `exercises/` (the solved sources); output answers quote the mojo-quest
// answer key (scripts/data/mojo-quest-outputs.json) exactly.

const deck: Deck = {
  id: "mojo-errors",
  title: "Mojo: errors & context managers",
  order: 4,
  section: "mojo",
  language: "mojo",
  blurb: "raises, raise, try/except, re-raise, with",
  cards: [
    // ============ MQ-4xx — Errors & Context Managers ============
    {
      id: "mojo-401",
      source: "mojo-quest MQ-401",
      type: "concept",
      front: "How do you declare that a Mojo function may raise an error?",
      code: `def validate_velocity(n: Int) raises -> Int:
    if n <= 0:
        raise Error("velocity must be positive")
    return n`,
      back: 'With the `raises` keyword after the parameter list; raise an error with `raise Error("...")`.',
      explanation:
        "`raises` is part of the function signature. A function that can raise but doesn't declare it is a compile error.",
    },
    {
      id: "mojo-402",
      source: "mojo-quest MQ-402",
      type: "output",
      front: "What does this program print?",
      code: `def checked(n: Int) raises -> Int:
    if n < 0:
        raise Error("negative reading")
    return n


def main():
    try:
        print("value:", checked(-1))
    except:
        print("value: 0")`,
      back: "`value: 0`",
      explanation:
        "`checked(-1)` raises, so the `try` block aborts and the `except` handler runs — printing the fallback.",
    },
    {
      id: "mojo-403",
      source: "mojo-quest MQ-403",
      type: "concept",
      front: "How do you re-raise a caught error in Mojo?",
      code: `def attempt() raises:
    try:
        raise Error("sensor fault")
    except e:
        print("logging:", e)
        raise e^`,
      back: "With `raise` plus the `^` sigil to transfer ownership of the error value: `raise e^`.",
      explanation:
        "`^` transfers ownership, ending the caught binding `e` while propagating the same error up the call stack.",
    },
    {
      id: "mojo-412",
      source: "mojo-quest MQ-412",
      type: "output",
      front: "What does this program print?",
      code: `def main() raises:
    # MQ Robotics stores the active calibration profile on disk.
    with open("calib.txt", "w") as f:
        f.write("max_speed=1.5")

    with open("calib.txt", "r") as f:
        print(f.read())`,
      back: "`max_speed=1.5`",
      explanation:
        "A `with` statement context manager releases its resource at the end of the block, even if an error occurs — so the write is flushed before the read.",
    },
  ],
};

export default deck;
