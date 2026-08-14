import type { Deck } from "../src/types.ts";

// The Mojo curriculum, split into teaching bands following mojo-quest's
// ordering. Code snippets are byte-faithful copies from mojo-quest
// `exercises/` (the solved sources); output answers quote the mojo-quest
// answer key (scripts/data/mojo-quest-outputs.json) exactly.

const deck: Deck = {
  id: "mojo-ownership",
  title: "Mojo: value ownership",
  order: 6,
  section: "mojo",
  language: "mojo",
  blurb: "mut args, ^ transfer sigil, ref returns",
  cards: [
    // ============ MQ-6xx — Value Ownership ============
    {
      id: "mojo-601",
      source: "mojo-quest MQ-601",
      type: "output",
      front: "What does this program print?",
      code: `def record_sample(mut total: Int, sample: Int):
    total += sample


def main():
    var total = 0
    record_sample(total, 12)
    record_sample(total, 8)
    print("Total distance:", total)`,
      back: "`Total distance: 20`",
      explanation:
        "Arguments are read-only by default; the `mut` convention lets the function write back to the caller's value.",
    },
    {
      id: "mojo-602",
      source: "mojo-quest MQ-602",
      type: "concept",
      front: "What does the `^` transfer sigil do to a variable?",
      code: `def load_map(var cells: List[Int]) -> Int:
    return len(cells)


def main():
    var cells = [16, 32, 64, 128]
    var result = load_map(cells^)
    print("map cells loaded:", result)`,
      back: "It ends the variable's lifetime and transfers ownership into a `var` argument.",
      explanation:
        "After `cells^`, the name `cells` is consumed — using it again is a compile error.",
    },
    {
      id: "mojo-604",
      source: "mojo-quest MQ-604",
      type: "output",
      front: "What does this program print?",
      code: `struct CommandQueue(Copyable, Movable):
    var depth: Int

    def __init__(out self, depth: Int):
        self.depth = depth

    def borrow_depth(ref self) -> ref[self.depth] Int:
        return self.depth


def main():
    var q = CommandQueue(4)
    ref d = q.borrow_depth()
    d = 10
    print("queue depth:", q.depth)`,
      back: "`queue depth: 10`",
      explanation:
        "A `ref` return value must name an origin (`ref[self.depth]`); it returns a reference to an existing value, not a copy.",
    },
  ],
};

export default deck;
