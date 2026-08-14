import type { Deck } from "../src/types.ts";

// The Mojo curriculum, split into teaching bands following mojo-quest's
// ordering. Code snippets are byte-faithful copies from mojo-quest
// `exercises/` (the solved sources); output answers quote the mojo-quest
// answer key (scripts/data/mojo-quest-outputs.json) exactly.

const deck: Deck = {
  id: "mojo-basics",
  title: "Mojo: basics & functions",
  order: 1,
  section: "mojo",
  language: "mojo",
  blurb: "entry point, def, args, return, raises",
  cards: [
    // ============ MQ-1xx — Basics, Functions & entry point ============
    {
      id: "mojo-101",
      source: "mojo-quest MQ-101",
      type: "output",
      front: "What does this program print?",
      code: `def boot():
    print("MQ Robotics control daemon starting")


def main():
    boot()`,
      back: "`MQ Robotics control daemon starting`",
      explanation:
        "Every Mojo program must define a function named `main()`; it is the entry point and runs first. Here `main` calls `boot()`.",
    },
    {
      id: "mojo-102",
      source: "mojo-quest MQ-102",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    print("MQ Robotics nav stack online")`,
      back: "`MQ Robotics nav stack online`",
      explanation:
        "Code blocks are defined by a colon followed by indented lines — Python-style, not braces.",
    },
    {
      id: "mojo-103",
      source: "mojo-quest MQ-103",
      type: "output",
      front: "What does this program print?",
      code: `def heartbeat() -> String:
    return "heartbeat ok"


def main():
    print(heartbeat())`,
      back: "`heartbeat ok`",
      explanation: "Mojo uses the `def` keyword to define functions.",
    },
    {
      id: "mojo-104",
      source: "mojo-quest MQ-104",
      type: "output",
      front: "What does this program print?",
      code: `def grid_cells(rows: Int, cols: Int) -> Int:
    return rows * cols


def main():
    print("Grid cells:", grid_cells(3, 4))`,
      back: "`Grid cells: 12`",
      explanation:
        "Parameters and the return type must be annotated: `rows: Int`, and the return type follows `->`.",
    },
    {
      id: "mojo-105",
      source: "mojo-quest MQ-105",
      type: "output",
      front: "What does this program print?",
      code: `def grow_capacity(n: Int) -> Int:
    return n * 2


def main():
    print("New capacity:", grow_capacity(21))`,
      back: "`New capacity: 42`",
      explanation:
        "Values are passed back with `return`; the return type is declared with the `-> type` syntax.",
    },
    {
      id: "mojo-106",
      source: "mojo-quest MQ-106",
      type: "concept",
      front: "What is a docstring, and where does it go?",
      code: `def log_command(name: String) -> String:
    """Return a log line announcing the command being dispatched."""
    return "Dispatching command: " + name`,
      back: "A string literal in triple quotes placed as the first statement in a function body.",
      explanation: "Like Python, Mojo's docstring documents the function and shows up in tooling.",
    },
    {
      id: "mojo-107",
      source: "mojo-quest MQ-107",
      type: "output",
      front: "What does this program print?",
      code: `def set_limits(max_speed: Int, max_accel: Int):
    print("speed:", max_speed, "accel:", max_accel)


def main():
    set_limits(max_speed=2, max_accel=5)`,
      back: "`speed: 2 accel: 5`",
      explanation:
        "Keyword arguments use `argument_name = argument_value` and can be passed in any order.",
    },
    {
      id: "mojo-108",
      source: "mojo-quest MQ-108",
      type: "output",
      front: "What does this program print?",
      code: `def spin_up(rpm: Int, ramp_ms: Int = 100) -> Int:
    return rpm + ramp_ms


def main():
    print("total:", spin_up(900))`,
      back: "`total: 1000`",
      explanation:
        "An optional argument carries a default value and must appear after any required arguments.",
    },
    {
      id: "mojo-109",
      source: "mojo-quest MQ-109",
      type: "output",
      front: "What does this program print?",
      code: `def run_diagnostic(name: String, *, verbose: Bool) -> String:
    if verbose:
        return name + " [verbose]"
    return name


def main():
    print(run_diagnostic("imu", verbose=True))`,
      back: "`imu [verbose]`",
      explanation:
        "A single star (`*`) in the argument list marks everything after it as keyword-only.",
    },
    {
      id: "mojo-110",
      source: "mojo-quest MQ-110",
      type: "output",
      front: "What does this program print?",
      code: `def total(*readings: Int) -> Int:
    var s = 0
    for r in readings:
        s += r
    return s


def main():
    print("sum:", total(3, 4, 5))`,
      back: "`sum: 12`",
      explanation:
        "The variadic syntax `*argument_name` accepts a variable number of arguments, iterated here in a `for` loop.",
    },
    {
      id: "mojo-111",
      source: "mojo-quest MQ-111",
      type: "output",
      front: "What does this program print?",
      code: `def run_self_test():
    # TODO: implement the real self-test later; this is just a stub
    pass


def main():
    run_self_test()
    print("self-test stub ran")`,
      back: "`self-test stub ran`",
      explanation:
        "`pass` is a no-op placeholder for a block that must have a body but has nothing to do yet.",
    },
    {
      id: "mojo-113",
      source: "mojo-quest MQ-113",
      type: "output",
      front: "What does this program print?",
      code: `def footprint(side: Int) -> Int:
    return side * side


def footprint(w: Int, h: Int) -> Int:
    return w * h


def main():
    print(footprint(4), footprint(2, 3))`,
      back: "`16 6`",
      explanation:
        'Implementing separate versions of a function with different argument types "overloads" it; Mojo picks the right one by the call\'s arguments.',
    },
    {
      id: "mojo-115",
      source: "mojo-quest MQ-115",
      type: "output",
      front: "What does this program print?",
      code: `def read_sensor(id: Int) raises -> Int:
    if id < 0:
        raise Error("bad sensor id")
    return id * 10


def main() raises:
    print("reading:", read_sensor(2))`,
      back: "`reading: 20`",
      explanation:
        "Functions are non-raising by default; add the `raises` keyword so a function may propagate an error to its caller.",
    },
  ],
};

export default deck;
