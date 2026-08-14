import type { Deck } from "../src/types.ts";

// The Mojo curriculum, split into teaching bands following mojo-quest's
// ordering. Code snippets are byte-faithful copies from mojo-quest
// `exercises/` (the solved sources); output answers quote the mojo-quest
// answer key (scripts/data/mojo-quest-outputs.json) exactly.

const deck: Deck = {
  id: "mojo-control-flow",
  title: "Mojo: operators & control flow",
  order: 3,
  section: "mojo",
  language: "mojo",
  blurb: "operators, if/elif/else, while, for, range, continue",
  cards: [
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
  ],
};

export default deck;
