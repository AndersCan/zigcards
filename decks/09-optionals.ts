import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "optionals",
  title: "Optionals",
  order: 9,
  blurb: "?T, null, orelse, if-capture",
  section: "zig",
  cards: [
    {
      id: "op-001",
      source: "ziglings 045_optionals",
      type: "fix",
      front: "Why doesn't this compile?",
      code: `const std = @import("std");

pub fn main() void {
    const result = deepThought();

    // Please threaten the result so that answer is either the
    // integer value from deepThought() OR the number 42:
    const answer: u8 = result;

    std.debug.print("The Ultimate Answer: {}.\\n", .{answer});
}

fn deepThought() ?u8 {
    // It seems Deep Thought's output has declined in quality.
    // But we'll leave this as-is. Sorry Deep Thought.
    return null;
}`,
      back: "`result` is an optional `?u8`, which can't be assigned straight to a `u8`. Unwrap it with `orelse`, supplying a fallback for null: `const answer: u8 = result orelse 42;`.",
      backCode: `const answer: u8 = result orelse 42;`,
      explanation:
        "An optional value must be guaranteed non-null before it can be used as its base type; `orelse` unwraps it or provides a default. It's like `catch` for error unions.",
    },
    {
      id: "op-002",
      source: "ziglings 045_optionals",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    const result = deepThought();

    // Please threaten the result so that answer is either the
    // integer value from deepThought() OR the number 42:
    const answer: u8 = result orelse 42;

    std.debug.print("The Ultimate Answer: {}.\\n", .{answer});
}

fn deepThought() ?u8 {
    // It seems Deep Thought's output has declined in quality.
    // But we'll leave this as-is. Sorry Deep Thought.
    return null;
}`,
      back: "`The Ultimate Answer: 42.`",
      explanation:
        "`deepThought()` returns `null`, so `orelse` discards the null and `answer` takes the fallback value 42.",
    },
    {
      id: "op-003",
      source: "ziglings 045_optionals",
      type: "concept",
      front: 'How do you express "a `u32`, or possibly nothing"?',
      code: `//     var foo: ?u32 = 10;
//
// Now foo can store a u32 integer OR null (a value storing
// the cosmic horror of a value NOT EXISTING!)
//
//     foo = null;`,
      back: '`?u32` — an optional type. It can hold a `u32` integer or `null`, the value representing "not existing".',
      explanation:
        "The `?` before a type marks every value of that type as optional; before use, the optional must be proven non-null.",
    },
    {
      id: "op-004",
      source: "ziglings 045_optionals",
      type: "concept",
      front: "`orelse` is to optionals what which keyword is to error unions?",
      code: `//    var maybe_bad: Error!u32 = Error.Evil;
//    var number: u32 = maybe_bad catch 0;`,
      back: "`catch` — both unwrap a value or supply a default: `foo orelse 2` and `maybe_bad catch 0`.",
      explanation:
        "Optionals can hold a value or null, and error unions can hold a value or an error; `orelse` and `catch` play the same unwrap-or-default role.",
    },
    {
      id: "op-005",
      source: "ziglings 046_optionals2",
      type: "fix",
      front: "What expression stops the walk at the end of the chain?",
      code: `const std = @import("std");

const Elephant = struct {
    letter: u8,
    tail: *Elephant = null, // Hmm... tail needs something...
    visited: bool = false,
};

fn visitElephants(first_elephant: *Elephant) void {
    var e = first_elephant;

    while (!e.visited) {
        std.debug.print("Elephant {u}. ", .{e.letter});
        e.visited = true;

        // We should stop once we encounter a tail that
        // does NOT point to another element. What can
        // we put here to make that happen?

        // HINT: We want something similar to what \`.?\` does,
        // but instead of ending the program, we want to exit the loop...
        e = e.tail ???
    }
}`,
      back: "`e = e.tail orelse break;` — if the tail is null, leave the loop instead of unwrapping. The `tail` field must also be optional: `?*Elephant = null`.",
      backCode: `e = e.tail orelse break;`,
      explanation:
        "Unlike `.?`, which would panic on a null tail, `orelse break` makes the walk end naturally at the last elephant.",
    },
    {
      id: "op-006",
      source: "ziglings 046_optionals2",
      type: "concept",
      front: "What is the `.?` shortcut equivalent to?",
      code: `//     const foo = bar.?;
//
// is the same as
//
//     const foo = bar orelse unreachable;`,
      back: "`bar.?` is the same as `bar orelse unreachable` — unwrap the optional, or hit `unreachable` (which panics in debug builds) if it's null.",
      explanation:
        "`.?` is the impatient unwrap: it guarantees the value exists, so use it only when null is truly impossible or you want a crash.",
    },
    {
      id: "op-007",
      source: "ziglings 046_optionals2",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

const Elephant = struct {
    letter: u8,
    tail: ?*Elephant = null, // Hmm... tail needs something...
    visited: bool = false,
};

pub fn main() void {
    var elephantA = Elephant{ .letter = 'A' };
    var elephantB = Elephant{ .letter = 'B' };
    var elephantC = Elephant{ .letter = 'C' };

    // Link the elephants so that each tail "points" to the next.
    linkElephants(&elephantA, &elephantB);
    linkElephants(&elephantB, &elephantC);

    // \`linkElephants\` will stop the program if you try and link an
    // elephant that doesn't exist! Uncomment and see what happens.
    // const missingElephant: ?*Elephant = null;
    // linkElephants(&elephantC, missingElephant);

    visitElephants(&elephantA);

    std.debug.print("\\n", .{});
}

// If e1 and e2 are valid pointers to elephants,
// this function links the elephants so that e1's tail "points" to e2.
fn linkElephants(e1: ?*Elephant, e2: ?*Elephant) void {
    e1.?.tail = e2.?;
}

// This function visits all elephants once, starting with the
// first elephant and following the tails to the next elephant.
fn visitElephants(first_elephant: *Elephant) void {
    var e = first_elephant;

    while (!e.visited) {
        std.debug.print("Elephant {u}. ", .{e.letter});
        e.visited = true;

        // We should stop once we encounter a tail that
        // does NOT point to another element. What can
        // we put here to make that happen?

        // HINT: We want something similar to what \`.?\` does,
        // but instead of ending the program, we want to exit the loop...
        e = e.tail orelse break;
    }
}`,
      back: "`Elephant A. Elephant B. Elephant C.`",
      explanation:
        "A links to B and B to C; C's tail is null, so `orelse break` ends the loop after the third elephant — no circle needed.",
    },
  ],
};

export default deck;
