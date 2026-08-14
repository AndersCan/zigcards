import type { Deck } from "../src/types.ts";

// The Mojo curriculum, split into teaching bands following mojo-quest's
// ordering. Code snippets are byte-faithful copies from mojo-quest
// `exercises/` (the solved sources); output answers quote the mojo-quest
// answer key (scripts/data/mojo-quest-outputs.json) exactly.

const deck: Deck = {
  id: "mojo-metaprogramming",
  title: "Mojo: metaprogramming",
  order: 8,
  section: "mojo",
  language: "mojo",
  blurb: "comptime, parameters, traits, Some, reflect",
  cards: [
    // ============ MQ-8xx — Metaprogramming ============
    {
      id: "mojo-801",
      source: "mojo-quest MQ-801",
      type: "concept",
      front: "How do you force an expression to be evaluated at compile time?",
      code: `def main():
    comptime tick_budget = 50 * 20
    print("tick budget:", tick_budget)`,
      back: "Assign it with `comptime`; Mojo evaluates the expression once at compile time.",
      explanation:
        "Compile-time values are baked into the binary — no runtime cost for the computation.",
    },
    {
      id: "mojo-803",
      source: "mojo-quest MQ-803",
      type: "output",
      front: "What does this program print?",
      code: `comptime NUM_AXES = 4


def main():
    var total = 0
    comptime for i in range(NUM_AXES):
        total += i
    print("axis sum:", total)`,
      back: "`axis sum: 6`",
      explanation:
        "`comptime for` fully unrolls the loop at compile time over a compile-time sequence like `range(NUM_AXES)`.",
    },
    {
      id: "mojo-810",
      source: "mojo-quest MQ-810",
      type: "output",
      front: "What does this program print?",
      code: `def scale[factor: Int](x: Int) -> Int:
    return x * factor


def main():
    print("Scaled:", scale[3](14))`,
      back: "`Scaled: 42`",
      explanation:
        "Parameters in `[]` are compile-time inputs; arguments in `()` are run-time values. `scale[3]` specializes the function with factor 3.",
    },
    {
      id: "mojo-812",
      source: "mojo-quest MQ-812",
      type: "output",
      front: "What does this program print?",
      code: `struct Buffer[size: Int](Copyable, Movable):
    def __init__(out self):
        pass

    def capacity(self) -> Int:
        return Self.size


def main():
    var b = Buffer[8]()
    print("capacity:", b.capacity())
    print("size:", b.size)`,
      back: "`capacity: 8\nsize: 8`",
      explanation:
        "A parameterized struct adds compile-time parameters in `[]` after its name; they're accessible on instances like `b.size`.",
    },
    {
      id: "mojo-825",
      source: "mojo-quest MQ-825",
      type: "output",
      front: "What does this program print?",
      code: `trait Sensor:
    def read(self) -> String:
        ...


struct Lidar(Sensor):
    var name: String

    def __init__(out self, name: String):
        self.name = name

    def read(self) -> String:
        return "Reading from " + self.name


def announce[T: Sensor](sensor: T):
    print(sensor.read())


def main():
    announce(Lidar("lidar-front"))`,
      back: "`Reading from lidar-front`",
      explanation:
        "Trait conformance is declared in parentheses after the struct name; the compiler enforces that `Lidar` implements `read`.",
    },
    {
      id: "mojo-827",
      source: "mojo-quest MQ-827",
      type: "output",
      front: "What does this program print?",
      code: `trait Greeter:
    def name(self) -> String:
        ...

    def greet(self) -> String:
        return "hello " + self.name()


struct Robot(Greeter):
    def __init__(out self):
        pass

    def name(self) -> String:
        return "amr"


def main():
    var r = Robot()
    print(r.greet())`,
      back: "`hello amr`",
      explanation:
        "A trait can provide a default method implementation that conforming structs inherit unless they override it.",
    },
    {
      id: "mojo-830",
      source: "mojo-quest MQ-830",
      type: "output",
      front: "What does this program print?",
      code: `struct Track(Sized):
    var name: String
    var waypoints: List[Int]

    def __init__(out self, name: String, var waypoints: List[Int]):
        self.name = name
        self.waypoints = waypoints^

    def __len__(self) -> Int:
        return len(self.waypoints)


def main():
    var t = Track("loop-a", [10, 20, 30, 40, 50])
    print("len:", len(t))`,
      back: "`len: 5`",
      explanation:
        "The `Sized` trait requires `__len__()`, which the built-in `len()` function uses.",
    },
    {
      id: "mojo-835",
      source: "mojo-quest MQ-835",
      type: "output",
      front: "What does this program print?",
      code: `# Logs any value the telemetry bus touches, whatever its type.
def log_value(value: Some[Writable]):
    print("telemetry:", value)


def main():
    log_value(42)
    log_value("ready")`,
      back: "`telemetry: 42\ntelemetry: ready`",
      explanation:
        "`Some[Trait]` is shorthand for a trait-constrained generic parameter: `value: Some[Writable]` accepts any type that is `Writable`.",
    },
    {
      id: "mojo-845",
      source: "mojo-quest MQ-845",
      type: "output",
      front: "What does this program print?",
      code: `def make_drive[num_motors: Int]() -> Int:
    # The drive train must pair motors across an even motor count.
    comptime assert num_motors % 2 == 0, "num_motors must be even"
    return num_motors * 64


def main():
    print("Drive slots:", make_drive[8]())`,
      back: "`Drive slots: 512`",
      explanation:
        '`comptime assert cond, "msg"` checks a condition at compile time; if it\'s false, compilation fails.',
    },
    {
      id: "mojo-852",
      source: "mojo-quest MQ-852",
      type: "output",
      front: "What does this program print?",
      code: `comptime dim = 8


def transform_size[dim: Int]() -> Int:
    # a dim x dim transform matrix has dim * dim entries
    return dim * dim


def main():
    print("matrix entries:", transform_size[dim]())`,
      back: "`matrix entries: 64`",
      explanation:
        "The `comptime` keyword forces an expression to be evaluated at compile time; `dim` here is a compile-time value passed to the parameter.",
    },
    {
      id: "mojo-858",
      source: "mojo-quest MQ-858",
      type: "output",
      front: "What does this program print?",
      code: `struct RobotConfig(Copyable, Movable):
    var max_speed: Int
    var wheel_radius: Int
    var num_sensors: Int

    def __init__(out self, max_speed: Int, wheel_radius: Int, num_sensors: Int):
        self.max_speed = max_speed
        self.wheel_radius = wheel_radius
        self.num_sensors = num_sensors


def main():
    comptime r = reflect[RobotConfig]()
    print("RobotConfig fields:", r.field_count())`,
      back: "`RobotConfig fields: 3`",
      explanation:
        "`reflect[T]` inspects a type at compile time, letting you query members like `field_count()`.",
    },
  ],
};

export default deck;
