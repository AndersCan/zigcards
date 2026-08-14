import type { Deck } from "../src/types.ts";

// The Mojo curriculum, split into teaching bands following mojo-quest's
// ordering. Code snippets are byte-faithful copies from mojo-quest
// `exercises/` (the solved sources); output answers quote the mojo-quest
// answer key (scripts/data/mojo-quest-outputs.json) exactly.

const deck: Deck = {
  id: "mojo-lifecycle",
  title: "Mojo: value lifecycle",
  order: 7,
  section: "mojo",
  language: "mojo",
  blurb: "__init__ overloads, @implicit, Copyable, __del__",
  cards: [
    // ============ MQ-7xx — Value Lifecycle ============
    {
      id: "mojo-702",
      source: "mojo-quest MQ-702",
      type: "output",
      front: "What does this program print?",
      code: `struct Waypoint(Copyable, Movable):
    var x: Int
    var y: Int

    def __init__(out self, x: Int, y: Int):
        self.x = x
        self.y = y


def main():
    var w = Waypoint(3, 7)
    print("y:", w.y)`,
      back: "`y: 7`",
      explanation:
        "By the end of a constructor, all of the struct's fields must be initialized — Mojo guarantees no uninitialized fields.",
    },
    {
      id: "mojo-703",
      source: "mojo-quest MQ-703",
      type: "output",
      front: "What does this program print?",
      code: `struct RobotConfig(Copyable, Movable):
    var name: String
    var max_rate: Int

    def __init__(out self, name: String, max_rate: Int):
        self.name = name
        self.max_rate = max_rate

    def __init__(out self, name: String, template: Self):
        self.name = name
        self.max_rate = template.max_rate


def main():
    var base = RobotConfig("base", 512)
    var arm = RobotConfig("arm", base)
    print("Robot:", arm.name, "max_rate:", arm.max_rate)`,
      back: "`Robot: arm max_rate: 512`",
      explanation:
        "Like any method, `__init__()` can be overloaded to construct the object from different arguments — here from a name and a template config.",
    },
    {
      id: "mojo-704",
      source: "mojo-quest MQ-704",
      type: "output",
      front: "What does this program print?",
      code: `struct Celsius(Copyable, Movable):
    var deg: Int

    @implicit
    def __init__(out self, deg: Int):
        self.deg = deg


def report(t: Celsius):
    print("temp:", t.deg)


def main():
    report(25)`,
      back: "`temp: 25`",
      explanation:
        "An `@implicit` single-argument constructor enables implicit conversion, so `25` becomes a `Celsius` without an explicit call.",
    },
    {
      id: "mojo-705",
      source: "mojo-quest MQ-705",
      type: "output",
      front: "What does this program print?",
      code: `struct ScanBuffer(Copyable):
    var samples: List[Int]

    def __init__(out self, var samples: List[Int]):
        self.samples = samples^

    def push(mut self, t: Int):
        self.samples.append(t)

    def size(self) -> Int:
        return len(self.samples)


def main():
    var original: List[Int] = [1, 2, 3]
    var snapshot = ScanBuffer(original^)
    var working = snapshot.copy()
    working.push(99)
    print("snapshot size:", snapshot.size())
    print("working size:", working.size())`,
      back: "`snapshot size: 3\nworking size: 4`",
      explanation:
        "Conforming to `Copyable` gives a type a compiler-synthesized `.copy()` method, so `working` can be mutated without touching `snapshot`.",
    },
    {
      id: "mojo-706",
      source: "mojo-quest MQ-706",
      type: "output",
      front: "What does this program print?",
      code: `struct Reading(ImplicitlyCopyable, Movable):
    var v: Int

    def __init__(out self, v: Int):
        self.v = v


def main():
    var a = Reading(5)
    var b = a
    print("a:", a.v, "b:", b.v)`,
      back: "`a: 5 b: 5`",
      explanation:
        "The `ImplicitlyCopyable` trait lets the compiler copy a value on a plain assignment (`var b = a`), leaving both usable.",
    },
    {
      id: "mojo-710",
      source: "mojo-quest MQ-710",
      type: "output",
      front: "What does this program print?",
      code: `struct MotorHandle:
    var motor_id: Int

    def __init__(out self, motor_id: Int):
        self.motor_id = motor_id
        print("Acquired motor", self.motor_id)

    def __del__(deinit self):
        print("Released motor", self.motor_id)


def drive():
    var handle = MotorHandle(0)
    print("Driving with motor", handle.motor_id)


def main():
    drive()
    print("Scheduler idle")`,
      back: "`Acquired motor 0\nDriving with motor 0\nReleased motor 0\nScheduler idle`",
      explanation:
        "Mojo calls a value's `__del__()` destructor when its lifetime ends (ASAP, last-use destruction) — here, when `drive()` returns.",
    },
  ],
};

export default deck;
