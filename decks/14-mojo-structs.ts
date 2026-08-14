import type { Deck } from "../src/types.ts";

// The Mojo curriculum, split into teaching bands following mojo-quest's
// ordering. Code snippets are byte-faithful copies from mojo-quest
// `exercises/` (the solved sources); output answers quote the mojo-quest
// answer key (scripts/data/mojo-quest-outputs.json) exactly.

const deck: Deck = {
  id: "mojo-structs",
  title: "Mojo: structs & modules",
  order: 5,
  section: "mojo",
  language: "mojo",
  blurb: "struct, self, methods, decorators, dunder operators, imports",
  cards: [
    // ============ MQ-5xx — Structs & Modules ============
    {
      id: "mojo-501",
      source: "mojo-quest MQ-501",
      type: "output",
      front: "What does this program print?",
      code: `struct LidarScan(Copyable, Movable):
    var near_points: Int
    var far_points: Int

    def __init__(out self, near_points: Int, far_points: Int):
        self.near_points = near_points
        self.far_points = far_points

    def total(self) -> Int:
        return self.near_points + self.far_points


def main():
    var scan = LidarScan(8, 256)
    print("Total points:", scan.total())`,
      back: "`Total points: 264`",
      explanation:
        "Struct fields are declared with `var` and a type annotation, and must be initialized in the constructor.",
    },
    {
      id: "mojo-502",
      source: "mojo-quest MQ-502",
      type: "output",
      front: "What does this program print?",
      code: `struct Battery:
    var charge: Int

    def __init__(out self, charge: Int):
        self.charge = charge

    def is_low(self) -> Bool:
        return self.charge < 20


def main():
    var b = Battery(15)
    print("low:", b.is_low())`,
      back: "`low: True`",
      explanation:
        "An instance method takes `self` as an explicit first argument, letting it act on a particular instance.",
    },
    {
      id: "mojo-503",
      source: "mojo-quest MQ-503",
      type: "output",
      front: "What does this program print?",
      code: `struct FrameCounter(Copyable, Movable):
    var count: Int

    def __init__(out self, count: Int):
        self.count = count

    def increment(mut self):
        self.count += 1

    def get(self) -> Int:
        return self.count


def main():
    var counter = FrameCounter(0)
    counter.increment()
    counter.increment()
    print("Frames handled:", counter.get())`,
      back: "`Frames handled: 2`",
      explanation:
        "To let a method mutate the instance, declare its receiver as `mut self`; read-only methods use plain `self`.",
    },
    {
      id: "mojo-504",
      source: "mojo-quest MQ-504",
      type: "output",
      front: "What does this program print?",
      code: `struct Encoder:
    @staticmethod
    def ticks_per_rev() -> Int:
        return 4096


def main():
    print("ppr:", Encoder.ticks_per_rev())`,
      back: "`ppr: 4096`",
      explanation:
        "A `@staticmethod` is called without an instance (`Encoder.ticks_per_rev()`) and doesn't receive `self`, so it can't access fields.",
    },
    {
      id: "mojo-505",
      source: "mojo-quest MQ-505",
      type: "output",
      front: "What does this program print?",
      code: `@fieldwise_init
struct LidarScan(Copyable, Movable):
    var near_points: Int
    var far_points: Int

    def total(self) -> Int:
        return self.near_points + self.far_points


def main():
    var scan = LidarScan(8, 256)
    print("Total points:", scan.total())`,
      back: "`Total points: 264`",
      explanation:
        "The `@fieldwise_init` decorator generates a field-wise constructor, so you don't have to write `__init__` by hand.",
    },
    {
      id: "mojo-507",
      source: "mojo-quest MQ-507",
      type: "output",
      front: "What does this program print?",
      code: `struct FileHandle(Movable):
    var fd: Int

    def __init__(out self, fd: Int):
        self.fd = fd


def take(var h: FileHandle) -> Int:
    return h.fd


def main():
    var h = FileHandle(3)
    print("fd:", take(h^))`,
      back: "`fd: 3`",
      explanation:
        "A move-only type is `Movable` but not `Copyable`; it's transferred with the `^` sigil rather than copied.",
    },
    {
      id: "mojo-510",
      source: "mojo-quest MQ-510",
      type: "output",
      front: "What does this program print?",
      code: `struct EnergyBudget(Copyable, Movable):
    var millijoules: Int

    def __init__(out self, millijoules: Int):
        self.millijoules = millijoules

    def __add__(self, other: Self) -> Self:
        return Self(self.millijoules + other.millijoules)


def main():
    var drive_budget = EnergyBudget(100)
    var sense_budget = EnergyBudget(56)
    var total = drive_budget + sense_budget
    print("combined budget:", total.millijoules)`,
      back: "`combined budget: 156`",
      explanation:
        "Mojo evaluates `a + b` by calling `a.__add__(b)` — the dunder method defines what `+` means for your type.",
    },
    {
      id: "mojo-511",
      source: "mojo-quest MQ-511",
      type: "output",
      front: "What does this program print?",
      code: `struct Offset(Copyable, Movable):
    var v: Int

    def __init__(out self, v: Int):
        self.v = v

    def __neg__(self) -> Self:
        return Self(-self.v)


def main():
    var o = Offset(5)
    var n = -o
    print("neg:", n.v)`,
      back: "`neg: -5`",
      explanation:
        "A unary operator like `-x` calls `__neg__()`, returning a new value representing the result.",
    },
    {
      id: "mojo-512",
      source: "mojo-quest MQ-512",
      type: "output",
      front: "What does this program print?",
      code: `struct Version(Copyable, Movable):
    var major: Int

    def __init__(out self, major: Int):
        self.major = major

    def __eq__(self, other: Self) -> Bool:
        return self.major == other.major


def main():
    var a = Version(2)
    var b = Version(2)
    print("equal:", a == b)`,
      back: "`equal: True`",
      explanation:
        "Implement `__eq__()` to support `==`; the `Equatable` trait provides `__eq__()` and `__ne__()`.",
    },
    {
      id: "mojo-513",
      source: "mojo-quest MQ-513",
      type: "output",
      front: "What does this program print?",
      code: `struct Frame(Copyable, Movable):
    var a: Int
    var b: Int
    var c: Int

    def __init__(out self, a: Int, b: Int, c: Int):
        self.a = a
        self.b = b
        self.c = c

    def __getitem__(self, i: Int) -> Int:
        if i == 0:
            return self.a
        if i == 1:
            return self.b
        return self.c


def main():
    var f = Frame(10, 20, 30)
    print("channel 1:", f[1])`,
      back: "`channel 1: 20`",
      explanation:
        "Implement `__getitem__()` to support subscript reads like `obj[i]`; `f[1]` dispatches to `f.__getitem__(1)`.",
    },
    {
      id: "mojo-520",
      source: "mojo-quest MQ-520",
      type: "output",
      front: "What does this program print?",
      code: `from std.math import sqrt


def main():
    var root = sqrt(144.0)
    print("Square root:", root)`,
      back: "`Square root: 12.0`",
      explanation:
        "`from module import name` imports a specific member from a module, keeping the standard library on demand.",
    },
  ],
};

export default deck;
