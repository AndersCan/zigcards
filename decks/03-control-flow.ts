import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "control-flow",
  title: "Control Flow",
  order: 3,
  blurb: "if, while, for",
  cards: [
    {
      id: "cf-001",
      source: "ziglings 009_if",
      type: "fix",
      front: "Why doesn't this compile?",
      code: `const std = @import("std");

pub fn main() void {
    const foo = 42;

    if (foo) {
        std.debug.print("Foo is 42!\\n", .{});
    } else {
        std.debug.print("Foo is not 42!\\n", .{});
    }
}`,
      back: "`if` only accepts `bool`; `foo` is a number (a `comptime_int`), so `if (foo)` is a type error. Use a comparison: `if (foo == 42)`.",
      backCode: `    if (foo == 42) {
        std.debug.print("Foo is 42!\\n", .{});
    } else {
        std.debug.print("Foo is not 42!\\n", .{});
    }`,
      explanation:
        "Zig does not coerce numbers to booleans — the `if` condition must be exactly a `bool`, so you need a comparison operator.",
    },
    {
      id: "cf-002",
      source: "ziglings 009_if",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    const foo = 42;

    if (foo == 42) {
        std.debug.print("Foo is 42!\\n", .{});
    } else {
        std.debug.print("Foo is not 42!\\n", .{});
    }
}`,
      back: "`Foo is 42!`",
      explanation: "The condition `foo == 42` is true, so the first branch runs.",
    },
    {
      id: "cf-003",
      source: "ziglings 010_if2",
      type: "fix",
      front: "What's the missing if...else expression for `price`?",
      code: `const std = @import("std");

pub fn main() void {
    const discount = true;

    const price: u8 = if ???;

    std.debug.print("With the discount, the price is \${}.\\n", .{price});
}`,
      back: "`const price: u8 = if (discount) 17 else 20;` — `if` is an expression, so it can produce a value.",
      backCode: `    const price: u8 = if (discount) 17 else 20;`,
      explanation:
        "When `discount` is true the expression evaluates to `17`, otherwise `20`; both branches have the same type so the result fits `u8`.",
    },
    {
      id: "cf-004",
      source: "ziglings 010_if2",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    const discount = true;

    const price: u8 = if (discount) 17 else 20;

    std.debug.print("With the discount, the price is \${}.\\n", .{price});
}`,
      back: "`With the discount, the price is $17.`",
      explanation:
        "`if (discount) 17 else 20` evaluates to 17 since `discount` is true; the `$` in the format string is literal and `{}` formats the price.",
    },
    {
      id: "cf-005",
      source: "ziglings 011_while",
      type: "fix",
      front: "What condition keeps this loop doubling `n` until it reaches 1024?",
      code: `const std = @import("std");

pub fn main() void {
    var n: u32 = 2;

    while (???) {
        std.debug.print("{} ", .{n});

        n *= 2;
    }

    std.debug.print("n={}\\n", .{n});
}`,
      back: "`while (n < 1024)` — the loop runs while the condition is true and stops when `n` reaches 1024.",
      backCode: `    while (n < 1024) {
        std.debug.print("{} ", .{n});

        n *= 2;
    }`,
      explanation:
        "Like `if`, the `while` condition must be a `bool`; comparing `n` to the target keeps the loop going until `n == 1024`.",
    },
    {
      id: "cf-006",
      source: "ziglings 011_while",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    var n: u32 = 2;

    while (n < 1024) {
        std.debug.print("{} ", .{n});

        n *= 2;
    }

    std.debug.print("n={}\\n", .{n});
}`,
      back: "`2 4 8 16 32 64 128 256 512 n=1024`",
      explanation:
        "`n` doubles each iteration (2→1024); the loop prints each value before doubling and stops once `n == 1024`, then the final print shows `n=1024`.",
    },
    {
      id: "cf-007",
      source: "ziglings 012_while2",
      type: "fix",
      front: "What continue expression makes this loop reach 1024?",
      code: `const std = @import("std");

pub fn main() void {
    var n: u32 = 2;

    while (n < 1000) : ??? {
        std.debug.print("{} ", .{n});
    }

    std.debug.print("n={}\\n", .{n});
}`,
      back: "`while (n < 1000) : (n *= 2)` — the continue expression after the `:` runs after every iteration.",
      backCode: `    while (n < 1000) : (n *= 2) {
        std.debug.print("{} ", .{n});
    }`,
      explanation:
        "The continue expression doubles `n` each time the loop restarts, producing the same 2…512 sequence as the previous exercise.",
    },
    {
      id: "cf-008",
      source: "ziglings 013_while3",
      type: "fix",
      front: "How do you skip numbers divisible by 3 or 5?",
      code: `const std = @import("std");

pub fn main() void {
    var n: u32 = 1;

    while (n <= 20) : (n += 1) {
        if (n % 3 == 0) ???;
        if (n % 5 == 0) ???;
        std.debug.print("{} ", .{n});
    }

    std.debug.print("\\n", .{});
}`,
      back: "Both lines are `continue;` — it skips to the next iteration, and the continue expression `(n += 1)` still runs.",
      backCode: `    while (n <= 20) : (n += 1) {
        if (n % 3 == 0) continue;
        if (n % 5 == 0) continue;
        std.debug.print("{} ", .{n});
    }`,
      explanation:
        "`%` is the modulo operator (remainder after division); `continue` restarts the loop early, and the continue expression runs even after a `continue`.",
    },
    {
      id: "cf-009",
      source: "ziglings 013_while3",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    var n: u32 = 1;

    while (n <= 20) : (n += 1) {
        if (n % 3 == 0) continue;
        if (n % 5 == 0) continue;
        std.debug.print("{} ", .{n});
    }

    std.debug.print("\\n", .{});
}`,
      back: "`1 2 4 7 8 11 13 14 16 17 19`",
      explanation:
        "Numbers divisible by 3 or 5 are skipped, so only the numbers 1–20 that aren't multiples of 3 or 5 print.",
    },
    {
      id: "cf-010",
      source: "ziglings 014_while4",
      type: "fix",
      front: "Why does this loop never end, and how do you stop it at `n == 4`?",
      code: `const std = @import("std");

pub fn main() void {
    var n: u32 = 1;

    while (true) : (n += 1) {
        if (???) ???;
    }

    std.debug.print("n={}\\n", .{n});
}`,
      back: "The condition is literally `true`, so the only way out is `break`: `if (n == 4) break;`.",
      backCode: `    while (true) : (n += 1) {
        if (n == 4) break;
    }`,
      explanation:
        "`break` exits the loop immediately; the continue expression does NOT run when the loop stops because of a `break`, so `n` stays at 4.",
    },
    {
      id: "cf-011",
      source: "ziglings 014_while4",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    var n: u32 = 1;

    while (true) : (n += 1) {
        if (n == 4) break;
    }

    std.debug.print("n={}\\n", .{n});
}`,
      back: "`n=4`",
      explanation:
        "`n` increments to 4, then `break` exits before the continue expression runs again, so the printed value is 4.",
    },
    {
      id: "cf-012",
      source: "ziglings 015_for",
      type: "fix",
      front: "What's missing so each element of `story` prints a scene?",
      code: `const std = @import("std");

pub fn main() void {
    const story = [_]u8{ 'h', 'h', 's', 'n', 'h' };

    std.debug.print("A Dramatic Story: ", .{});

    for (???) |???| {
        if (scene == 'h') std.debug.print(":-)  ", .{});
        if (scene == 's') std.debug.print(":-(  ", .{});
        if (scene == 'n') std.debug.print(":-|  ", .{});
    }

    std.debug.print("The End.\\n", .{});
}`,
      back: "`for (story) |scene|` — a `for` loop captures each element of the array into a local name.",
      backCode: `    for (story) |scene| {
        if (scene == 'h') std.debug.print(":-)  ", .{});
        if (scene == 's') std.debug.print(":-(  ", .{});
        if (scene == 'n') std.debug.print(":-|  ", .{});
    }`,
      explanation:
        "`for (items) |item|` runs the body once per element, binding `item` to the current element.",
    },
    {
      id: "cf-013",
      source: "ziglings 015_for",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    const story = [_]u8{ 'h', 'h', 's', 'n', 'h' };

    std.debug.print("A Dramatic Story: ", .{});

    for (story) |scene| {
        if (scene == 'h') std.debug.print(":-)  ", .{});
        if (scene == 's') std.debug.print(":-(  ", .{});
        if (scene == 'n') std.debug.print(":-|  ", .{});
    }

    std.debug.print("The End.\\n", .{});
}`,
      back: "`A Dramatic Story: :-)  :-)  :-(  :-|  :-)  The End.`",
      explanation:
        "The story is `h h s n h`, and each letter picks an emoticon: `h` → `:-)`, `s` → `:-(`, `n` → `:-|`.",
    },
    {
      id: "cf-014",
      source: "ziglings 016_for2",
      type: "fix",
      front: "What makes this loop capture both the element and its index?",
      code: `const std = @import("std");

pub fn main() void {
    const bits = [_]u8{ 1, 0, 1, 1 };
    var value: u32 = 0;

    for (bits, ???) |bit, ???| {
        const i_u32: u32 = @intCast(i);
        const place_value = std.math.pow(u32, 2, i_u32);
        value += place_value * bit;
    }

    std.debug.print("The value of bits '1101': {}.\\n", .{value});
}`,
      back: "`for (bits, 0..) |bit, i|` — adding the range `0..` as a second iterable makes the loop capture the index alongside each element.",
      backCode: `    for (bits, 0..) |bit, i| {
        const i_u32: u32 = @intCast(i);
        const place_value = std.math.pow(u32, 2, i_u32);
        value += place_value * bit;
    }`,
      explanation:
        "A `for` over multiple objects captures one value per object; here `i` is the index, converted to `u32` with `@intCast` so `std.math.pow` can use it.",
    },
    {
      id: "cf-015",
      source: "ziglings 016_for2",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    const bits = [_]u8{ 1, 0, 1, 1 };
    var value: u32 = 0;

    for (bits, 0..) |bit, i| {
        const i_u32: u32 = @intCast(i);
        const place_value = std.math.pow(u32, 2, i_u32);
        value += place_value * bit;
    }

    std.debug.print("The value of bits '1101': {}.\\n", .{value});
}`,
      back: "`The value of bits '1101': 13.`",
      explanation:
        "Bits are little-endian: bit 0 (1), bit 2 (1), and bit 3 (1) contribute 1 + 4 + 8 = 13.",
    },
    {
      id: "cf-016",
      source: "ziglings 017_quiz2",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    var i: u8 = 1;
    const stop_at: u8 = 16;

    while (i <= stop_at) : (i += 1) {
        if (i % 3 == 0) std.debug.print("Fizz", .{});
        if (i % 5 == 0) std.debug.print("Buzz", .{});
        if (!(i % 3 == 0) and !(i % 5 == 0)) {
            std.debug.print("{}", .{i});
        }
        std.debug.print(", ", .{});
    }
    std.debug.print("\\n", .{});
}`,
      back: "`1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz, 16,`",
      explanation:
        "Classic FizzBuzz: multiples of 3 print `Fizz`, multiples of 5 print `Buzz`, multiples of both print `FizzBuzz`; the `and`/`not` guard prints the number when neither applies.",
    },
  ],
};

export default deck;
