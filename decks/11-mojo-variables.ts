import type { Deck } from "../src/types.ts";

// The Mojo curriculum, split into teaching bands following mojo-quest's
// ordering. Code snippets are byte-faithful copies from mojo-quest
// `exercises/` (the solved sources); output answers quote the mojo-quest
// answer key (scripts/data/mojo-quest-outputs.json) exactly.

const deck: Deck = {
  id: "mojo-variables",
  title: "Mojo: variables & collections",
  order: 2,
  section: "mojo",
  language: "mojo",
  blurb: "var, types, SIMD, String, List, Tuple, Dict, Set, Optional",
  cards: [
    // ============ MQ-2xx — Variables, Types, Literals & Collections ============
    {
      id: "mojo-201",
      source: "mojo-quest MQ-201",
      type: "concept",
      front: "How do you declare an explicit, mutable variable in Mojo?",
      code: `def main():
    var tick_count = 0
    tick_count += 1
    print("Ticks processed:", tick_count)`,
      back: "With the `var` keyword: `var tick_count = 0`.",
      explanation:
        "`var` creates a variable you can mutate; Mojo also has `alias` for compile-time constants.",
    },
    {
      id: "mojo-202",
      source: "mojo-quest MQ-202",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    var threshold: Int
    threshold = 10
    print("threshold:", threshold)`,
      back: "`threshold: 10`",
      explanation:
        "Late initialization (declaring without a value) works only if the variable is declared with a type.",
    },
    {
      id: "mojo-203",
      source: "mojo-quest MQ-203",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    var count: Int = 5
    print("count:", count)`,
      back: "`count: 5`",
      explanation:
        "Variables are strongly typed: assigning a value of a different type is a compile error.",
    },
    {
      id: "mojo-207",
      source: "mojo-quest MQ-207",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    var a = [1, 2, 3]
    var b = a.copy()
    a.append(4)
    print("a:", len(a), "b:", len(b))`,
      back: "`a: 4 b: 3`",
      explanation:
        "A variable owns its value; `a.copy()` makes an explicit copy, so mutating `a` doesn't affect `b`.",
    },
    {
      id: "mojo-208",
      source: "mojo-quest MQ-208",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    var readings = [10, 20, 30]
    ref first = readings[0]
    first = 99
    print("first:", readings[0])`,
      back: "`first: 99`",
      explanation:
        "The `ref name` syntax binds a reference to a value rather than an owned copy, so writing through it mutates the original.",
    },
    {
      id: "mojo-210",
      source: "mojo-quest MQ-210",
      type: "output",
      front: "What does this program print?",
      code: `def widen_add(reading: Int8, total: Int64) -> Int64:
    return Int64(reading) + total


def main():
    print("total:", widen_add(100, 1000))`,
      back: "`total: 1100`",
      explanation:
        "Numeric operators don't automatically narrow or widen operands to a common type — the `Int8` is explicitly widened to `Int64` first.",
    },
    {
      id: "mojo-211",
      source: "mojo-quest MQ-211",
      type: "output",
      front: "What does this program print?",
      code: `def avg_latency(total_ms: Int, num_loops: Int) -> Float64:
    return Float64(total_ms) / Float64(num_loops)


def main():
    print("avg latency:", avg_latency(7, 2))`,
      back: "`avg latency: 3.5`",
      explanation:
        "Integer division truncates, so convert operands to the target type's constructor first to keep the fractional part.",
    },
    {
      id: "mojo-213",
      source: "mojo-quest MQ-213",
      type: "output",
      front: "What does this program print?",
      code: `comptime Velocity = SIMD[DType.float32, 4]


def main():
    var v = Velocity(1.0, 2.0, 3.0, 4.0)
    print("Velocity lane 0:", v[0])`,
      back: "`Velocity lane 0: 1.0`",
      explanation:
        "A `SIMD` value is a fixed-size vector parameterized by a `DType` and the number of elements; lanes are indexed like `v[0]`.",
    },
    {
      id: "mojo-214",
      source: "mojo-quest MQ-214",
      type: "output",
      front: "What does this program print?",
      code: `def combine_counts(
    a: SIMD[DType.int32, 4], b: SIMD[DType.int32, 4]
) -> SIMD[DType.int32, 4]:
    return a + b


def main():
    var imu_a = SIMD[DType.int32, 4](1, 2, 3, 4)
    var imu_b = SIMD[DType.int32, 4](10, 20, 30, 40)
    print("Combined counts:", combine_counts(imu_a, imu_b))`,
      back: "`Combined counts: [11, 22, 33, 44]`",
      explanation:
        "Math on SIMD values is applied elementwise: each lane of `a` is added to the matching lane of `b`.",
    },
    {
      id: "mojo-215",
      source: "mojo-quest MQ-215",
      type: "output",
      front: "What does this program print?",
      code: `def device_tag(family: String, model: String) -> String:
    return (family + "-" + model).upper()


def main():
    print(device_tag("mq", "amr"))`,
      back: "`MQ-AMR`",
      explanation:
        "`String` supports operators like `+` and common methods such as `upper()`, mirroring Python strings.",
    },
    {
      id: "mojo-219",
      source: "mojo-quest MQ-219",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    var path: List[Int] = [10, 20, 30]
    path[0] = 15
    print("first waypoint:", path[0])
    print("waypoints:", len(path))`,
      back: "`first waypoint: 15\nwaypoints: 3`",
      explanation:
        "Index a `List` with `list[i]` to read an element; assigning to `list[i]` replaces it in place.",
    },
    {
      id: "mojo-220",
      source: "mojo-quest MQ-220",
      type: "output",
      front: "What does this program print?",
      code: `def scan_stats() -> Tuple[Int, Int]:
    var num_scans = 4
    var total_points = 512
    return (num_scans, total_points)


def main():
    var stats = scan_stats()
    var scans = stats[0]
    var points = stats[1]
    print("scans:", scans)
    print("points:", points)`,
      back: "`scans: 4\npoints: 512`",
      explanation:
        "A `Tuple` is an ordered collection; unpack it or index it with `stats[0]`, `stats[1]` to get individual values.",
    },
    {
      id: "mojo-221",
      source: "mojo-quest MQ-221",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    var waypoints = List[Int]()
    waypoints.append(128)
    waypoints.append(256)
    print("Queued waypoints:", len(waypoints))`,
      back: "`Queued waypoints: 2`",
      explanation:
        "A given `List` can only hold one type of value, specified at compile time as a parameter: `List[Int]`.",
    },
    {
      id: "mojo-222",
      source: "mojo-quest MQ-222",
      type: "output",
      front: "What does this program print?",
      code: `from std.collections import Dict


def main() raises:
    var joint_angles = Dict[String, Int]()
    joint_angles["joint_3"] = 128
    joint_angles["joint_8"] = 256
    print("joint angle:", joint_angles["joint_3"])
    print("joints:", len(joint_angles))`,
      back: "`joint angle: 128\njoints: 2`",
      explanation:
        "`Dict` holds key-value pairs; the key type and value type are both specified as parameters.",
    },
    {
      id: "mojo-223",
      source: "mojo-quest MQ-223",
      type: "output",
      front: "What does this program print?",
      code: `from std.collections import Set


def main():
    var seen = Set[Int]()
    seen.add(1)
    seen.add(1)
    seen.add(2)
    print("unique:", len(seen))`,
      back: "`unique: 2`",
      explanation: "`Set` holds unique values — adding `1` twice still yields just `{1, 2}`.",
    },
    {
      id: "mojo-224",
      source: "mojo-quest MQ-224",
      type: "output",
      front: "What does this program print?",
      code: `from std.collections import Optional


def cache_lookup(sensor_id: Int) -> Optional[Int]:
    if sensor_id == 7:
        return 512
    return None


def main() raises:
    var hit = cache_lookup(7)
    var miss = cache_lookup(3)
    if hit:
        print("hit:", hit.value())
    else:
        print("hit:", hit)
    if miss:
        print("miss:", miss.value())
    else:
        print("miss:", miss)`,
      back: "`hit: 512\nmiss: None`",
      explanation:
        "An `Optional` represents a value that may or may not be present; test it in an `if` and read it with `.value()`.",
    },
  ],
};

export default deck;
