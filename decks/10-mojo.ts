import type { Deck } from "../src/types.ts";

// The Mojo curriculum, one card per mojo-quest exercise (MQ-101 → MQ-951),
// in mojo-quest's teaching order. Code snippets are byte-faithful copies from
// mojo-quest `exercises/` (the solved sources); output answers quote the
// mojo-quest answer key (scripts/data/mojo-quest-outputs.json) exactly.

const deck: Deck = {
  id: "mojo",
  title: "Mojo",
  order: 1,
  section: "mojo",
  language: "mojo",
  blurb: "The Mojo curriculum, from mojo-quest",
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

    // ============ MQ-3xx — Operators & Control Flow ============
    {
      id: "mojo-301",
      source: "mojo-quest MQ-301",
      type: "output",
      front: "What does this program print?",
      code: `def square_area(side: Int) -> Int:
    return side**2


def main():
    print("area:", square_area(4))`,
      back: "`area: 16`",
      explanation: "Exponentiation uses two stars (`**`), not a caret.",
    },
    {
      id: "mojo-302",
      source: "mojo-quest MQ-302",
      type: "output",
      front: "What does this program print?",
      code: `def split_into_bins(total: Int, per_bin: Int) -> Tuple[Int, Int]:
    return total // per_bin, total % per_bin


def main():
    var result = split_into_bins(17, 5)
    print("bins:", result[0], "left:", result[1])`,
      back: "`bins: 3 left: 2`",
      explanation: "`//` is floor division and `%` returns the remainder: 17 // 5 = 3, 17 % 5 = 2.",
    },
    {
      id: "mojo-303",
      source: "mojo-quest MQ-303",
      type: "output",
      front: "What does this program print?",
      code: `def battery_low(level: Int) -> Bool:
    return level <= 20


def main():
    print("low:", battery_low(20))`,
      back: "`low: True`",
      explanation:
        "Mojo provides six comparison operators — `==`, `!=`, `<`, `<=`, `>`, `>=` — each returning a `Bool`.",
    },
    {
      id: "mojo-304",
      source: "mojo-quest MQ-304",
      type: "output",
      front: "What does this program print?",
      code: `def in_range(temp: Int) -> Bool:
    return 0 <= temp <= 85


def main():
    print("in range:", in_range(90))`,
      back: "`in range: False`",
      explanation:
        "Comparisons chain: `a < b < c` is equivalent to `(a < b) and (b < c)`. 90 exceeds 85, so the range test is false.",
    },
    {
      id: "mojo-305",
      source: "mojo-quest MQ-305",
      type: "output",
      front: "What does this program print?",
      code: `def status_word(ready: Int, armed: Int) -> Int:
    return ready | armed


def main():
    var READY = 1
    var ARMED = 2
    var flags = status_word(READY, ARMED)
    print("armed:", (flags & ARMED) != 0)`,
      back: "`armed: True`",
      explanation:
        "Bitwise OR (`|`) keeps bits set in either operand: 1 | 2 = 3, and 3 & 2 is non-zero, so the armed bit is set.",
    },
    {
      id: "mojo-306",
      source: "mojo-quest MQ-306",
      type: "output",
      front: "What does this program print?",
      code: `def can_drive(has_fix: Bool, calibrated: Bool) -> Bool:
    return has_fix and calibrated


def main():
    print("go:", can_drive(True, False))`,
      back: "`go: False`",
      explanation: "With `and`, both operands must be truthy; `True and False` is `False`.",
    },
    {
      id: "mojo-308",
      source: "mojo-quest MQ-308",
      type: "output",
      front: "What does this program print?",
      code: `def is_allowed(sensor_id: Int, allowed: List[Int]) -> Bool:
    return sensor_id in allowed


def main():
    var allowed = [2, 4, 6]
    print("ok:", is_allowed(4, allowed))`,
      back: "`ok: True`",
      explanation: "The `in` operator checks whether a collection contains a value.",
    },
    {
      id: "mojo-309",
      source: "mojo-quest MQ-309",
      type: "output",
      front: "What does this program print?",
      code: `def speed_label(speed: Int) -> String:
    return "fast" if speed > 10 else "slow"


def main():
    print("mode:", speed_label(12))`,
      back: "`mode: fast`",
      explanation:
        "A conditional expression has the form `value_if_true if condition else value_if_false`.",
    },
    {
      id: "mojo-310",
      source: "mojo-quest MQ-310",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    var scale = 2
    scale *= 3
    print("scale:", scale)`,
      back: "`scale: 6`",
      explanation:
        "Compound assignment forms like `*=` update the left-hand value in place instead of creating a new one.",
    },
    {
      id: "mojo-312",
      source: "mojo-quest MQ-312",
      type: "output",
      front: "What does this program print?",
      code: `def path_cost(setup: Int, per_segment: Int, segments: Int) -> Int:
    # setup plus per-segment cost, then multiplied across the segments
    return (setup + per_segment) * segments


def main():
    print("Total distance:", path_cost(2, 3, 4))`,
      back: "`Total distance: 20`",
      explanation:
        "Precedence decides what runs first (multiply before add); parentheses force `(2 + 3) * 4`.",
    },
    {
      id: "mojo-320",
      source: "mojo-quest MQ-320",
      type: "output",
      front: "What does this program print?",
      code: `def route_task(queue_depth: Int) -> String:
    if queue_depth > 100:
        return "overflow-core"
    else:
        return "fast-core"


def main():
    print(route_task(250))
    print(route_task(40))`,
      back: "`overflow-core\nfast-core`",
      explanation:
        "The `if` statement runs its indented block when the boolean expression is `True`; 250 is over 100, 40 is not.",
    },
    {
      id: "mojo-321",
      source: "mojo-quest MQ-321",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    var attempt = 1
    var total = 0
    while attempt <= 5:
        total += attempt
        attempt += 1
    print("Retry budget:", total)`,
      back: "`Retry budget: 15`",
      explanation:
        "The `while` loop repeats while its boolean expression is `True`; here it sums 1 through 5.",
    },
    {
      id: "mojo-322",
      source: "mojo-quest MQ-322",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    var total = 0
    for i in range(1, 10):
        if i % 3 == 0:
            continue
        total += i
    print("Scheduled units:", total)`,
      back: "`Scheduled units: 27`",
      explanation:
        "`continue` skips the rest of the loop body and resumes with the next element, dropping multiples of 3: 1+2+4+5+7+8 = 27.",
    },
    {
      id: "mojo-323",
      source: "mojo-quest MQ-323",
      type: "output",
      front: "What does this program print?",
      code: `def power_mode(level: Int) -> String:
    if level >= 80:
        return "boost"
    elif level >= 30:
        return "cruise"
    else:
        return "sleep"


def main():
    print(power_mode(95))
    print(power_mode(50))
    print(power_mode(10))`,
      back: "`boost\ncruise\nsleep`",
      explanation:
        "`elif` adds another condition, checked only when all earlier branches were false.",
    },
    {
      id: "mojo-324",
      source: "mojo-quest MQ-324",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    var total = 0
    for i in range(0, 10, 2):
        total += i
    print("total:", total)`,
      back: "`total: 20`",
      explanation:
        "`range(start, stop, step)` generates a sequence; `range(0, 10, 2)` yields 0,2,4,6,8, which sum to 20.",
    },
    {
      id: "mojo-325",
      source: "mojo-quest MQ-325",
      type: "output",
      front: "What does this program print?",
      code: `def main():
    var readings = [1, 2, 3]
    for ref r in readings:
        r += 10
    print("first:", readings[0])`,
      back: "`first: 11`",
      explanation:
        "Adding `ref` before the loop variable binds a reference, so mutations write back into the collection.",
    },
    {
      id: "mojo-326",
      source: "mojo-quest MQ-326",
      type: "output",
      front: "What does this program print?",
      code: `def total_points(batch: List[Int]) -> Int:
    var total = 0
    for count in batch:
        total += count
    return total


def main():
    var batch: List[Int] = [12, 8, 20, 5]
    print("total points:", total_points(batch))`,
      back: "`total points: 45`",
      explanation:
        "All collection types in the `collections` module support `for` iteration over each element.",
    },

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
