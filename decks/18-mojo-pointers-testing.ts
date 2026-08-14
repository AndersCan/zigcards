import type { Deck } from "../src/types.ts";

// The Mojo curriculum, split into teaching bands following mojo-quest's
// ordering. Code snippets are byte-faithful copies from mojo-quest
// `exercises/` (the solved sources); output answers quote the mojo-quest
// answer key (scripts/data/mojo-quest-outputs.json) exactly.

const deck: Deck = {
  id: "mojo-pointers-testing",
  title: "Mojo: pointers & testing",
  order: 9,
  section: "mojo",
  language: "mojo",
  blurb: "alloc, ptr indexing, assert_equal, assert_raises",
  cards: [
    // ============ MQ-9xx — Pointers, Low-Level Interop & Testing ============
    {
      id: "mojo-901",
      source: "mojo-quest MQ-901",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    # Stage a single encoder reading in a scratch buffer on the heap.
    var ptr = alloc[Int](1)
    ptr[] = 99
    var value = ptr[]
    print("Encoder count:", value)
    ptr.free()`,
      back: "`Encoder count: 99`",
      explanation:
        "`alloc[T](n)` allocates uninitialized heap memory for `n` values; `ptr[]` reads or writes the element, and `ptr.free()` releases it.",
    },
    {
      id: "mojo-903",
      source: "mojo-quest MQ-903",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    var ptr = alloc[Int](2)
    ptr[0] = 10
    ptr[1] = 20
    print("second:", ptr[1])
    ptr.free()`,
      back: "`second: 20`",
      explanation: "With space for multiple values, `ptr[i]` accesses the element at offset `i`.",
    },
    {
      id: "mojo-950",
      source: "mojo-quest MQ-950",
      type: "concept",
      front: "How do you assert two values are equal in a Mojo test?",
      code: `from std.testing import assert_equal


def total_distance(near: Int, far: Int) -> Int:
    return near + far


def main() raises:
    assert_equal(total_distance(100, 50), 150)
    print("All checks passed!")`,
      back: "With `assert_equal(actual, expected)` from the `testing` module.",
      explanation:
        "If the values differ, `assert_equal` raises and the test fails; this program prints `All checks passed!` because 150 == 150.",
    },
    {
      id: "mojo-951",
      source: "mojo-quest MQ-951",
      type: "output",
      front: "What does this program print?",
      code: `from std.testing import assert_raises


def clamp(n: Int) raises -> Int:
    if n < 0:
        raise Error("negative speed")
    return n


def main() raises:
    with assert_raises():
        _ = clamp(-1)
    print("raised as expected")`,
      back: "`raised as expected`",
      explanation:
        "`assert_raises` from the `testing` module is a context manager that asserts its `with` block raises an error — `clamp(-1)` does.",
    },
  ],
};

export default deck;
