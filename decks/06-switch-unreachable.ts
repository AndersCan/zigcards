import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "switch-unreachable",
  title: "switch, unreachable, if-error",
  order: 6,
  blurb: "switch, unreachable, error handling",
  section: "zig",
  cards: [
    {
      id: "sw-001",
      source: "ziglings 030_switch",
      type: "fix",
      front: "Why doesn't this compile, and what's the fix?",
      code: `const std = @import("std");

pub fn main() void {
    const lang_chars = [_]u8{ 26, 9, 7, 42 };

    for (lang_chars) |c| {
        switch (c) {
            1 => std.debug.print("A", .{}),
            2 => std.debug.print("B", .{}),
            3 => std.debug.print("C", .{}),
            // ... we don't need everything in between ...
            25 => std.debug.print("Y", .{}),
            26 => std.debug.print("Z", .{}),
        }
    }

    std.debug.print("\\n", .{});
}`,
      back: '`switch` must be exhaustive, and `c` is a `u8` whose other values (like 42) have no prong. Add `else => std.debug.print("?", .{}),`.',
      backCode: `else => std.debug.print("?", .{}),`,
      explanation:
        "The `else` prong matches every value not explicitly listed, making the switch exhaustive.",
    },
    {
      id: "sw-002",
      source: "ziglings 030_switch",
      type: "output",
      front: "What does this program print?",
      code: `const std = @import("std");

pub fn main() void {
    const lang_chars = [_]u8{ 26, 9, 7, 42 };

    for (lang_chars) |c| {
        switch (c) {
            1 => std.debug.print("A", .{}),
            2 => std.debug.print("B", .{}),
            3 => std.debug.print("C", .{}),
            // ... we don't need everything in between ...
            25 => std.debug.print("Y", .{}),
            26 => std.debug.print("Z", .{}),
            else => std.debug.print("?", .{}),
        }
    }

    std.debug.print("\\n", .{});
}`,
      back: "`ZIG?`",
      explanation: "26 → Z, 9 → I, 7 → G, and 42 has no explicit prong so the `else` prints `?`.",
    },
    {
      id: "sw-003",
      source: "ziglings 031_switch2",
      type: "fix",
      front: "What's missing so this switch expression compiles?",
      code: `const std = @import("std");

pub fn main() void {
    const lang_chars = [_]u8{ 26, 9, 7, 42 };

    for (lang_chars) |c| {
        const real_char: u8 = switch (c) {
            1 => 'A',
            2 => 'B',
            3 => 'C',
            4 => 'D',
            5 => 'E',
            6 => 'F',
            7 => 'G',
            8 => 'H',
            9 => 'I',
            10 => 'J',
            // ...
            25 => 'Y',
            26 => 'Z',
        };

        std.debug.print("{c}", .{real_char});
    }

    std.debug.print("\\n", .{});
}`,
      back: "Add the `else` prong returning an exclamation mark: `else => '!',` — a switch used as an expression must also be exhaustive.",
      backCode: `else => '!',`,
      explanation:
        "Here `switch` is an expression: each prong produces the value assigned to `real_char`.",
    },
    {
      id: "sw-004",
      source: "ziglings 031_switch2",
      type: "output",
      front: "What does this program print?",
      code: `const std = @import("std");

pub fn main() void {
    const lang_chars = [_]u8{ 26, 9, 7, 42 };

    for (lang_chars) |c| {
        const real_char: u8 = switch (c) {
            1 => 'A',
            2 => 'B',
            3 => 'C',
            4 => 'D',
            5 => 'E',
            6 => 'F',
            7 => 'G',
            8 => 'H',
            9 => 'I',
            10 => 'J',
            // ...
            25 => 'Y',
            26 => 'Z',
            else => '!',
        };

        std.debug.print("{c}", .{real_char});
    }

    std.debug.print("\\n", .{});
}`,
      back: "`ZIG!`",
      explanation:
        "26 → 'Z', 9 → 'I', 7 → 'G', and 42 hits the `else` prong → '!'. `{c}` formats the value as a character.",
    },
    {
      id: "sw-005",
      source: "ziglings 032_unreachable",
      type: "fix",
      front: "This switch doesn't cover every `u8` value. What should the missing prong be?",
      code: `const std = @import("std");

pub fn main() void {
    const operations = [_]u8{ 1, 1, 1, 3, 2, 2 };

    var current_value: u32 = 0;

    for (operations) |op| {
        switch (op) {
            1 => {
                current_value += 1;
            },
            2 => {
                current_value -= 1;
            },
            3 => {
                current_value *= current_value;
            },
        }

        std.debug.print("{} ", .{current_value});
    }

    std.debug.print("\\n", .{});
}`,
      back: "Add `else => unreachable` — we know only 1, 2, 3 occur, and reaching any other value is a bug.",
      backCode: `else => unreachable,`,
      explanation:
        "`unreachable` tells the compiler a branch can never execute, satisfying exhaustiveness; in Debug builds, actually reaching it panics.",
    },
    {
      id: "sw-006",
      source: "ziglings 032_unreachable",
      type: "output",
      front: "What does this program print?",
      code: `const std = @import("std");

pub fn main() void {
    const operations = [_]u8{ 1, 1, 1, 3, 2, 2 };

    var current_value: u32 = 0;

    for (operations) |op| {
        switch (op) {
            1 => {
                current_value += 1;
            },
            2 => {
                current_value -= 1;
            },
            3 => {
                current_value *= current_value;
            },
            else => unreachable,
        }

        std.debug.print("{} ", .{current_value});
    }

    std.debug.print("\\n", .{});
}`,
      back: "`1 2 3 9 8 7`",
      explanation: "Operations: +1 → 1, +1 → 2, +1 → 3, square → 9, −1 → 8, −1 → 7.",
    },
    {
      id: "sw-007",
      source: "ziglings 032_unreachable",
      type: "concept",
      front: "What is `unreachable` in Zig?",
      back: "A statement telling the compiler that reaching that branch is an error and should never happen.",
      explanation:
        "It lets a switch be exhaustive with a prong you believe is dead code. In Debug builds, actually reaching it is a panic.",
    },
    {
      id: "sw-008",
      source: "ziglings 033_iferror",
      type: "fix",
      front: "The `else |err|` branch switches over errors. What's missing?",
      code: `const std = @import("std");

const MyNumberError = error{
    TooBig,
    TooSmall,
};

pub fn main() void {
    const nums = [_]u8{ 2, 3, 4, 5, 6 };

    for (nums) |num| {
        std.debug.print("{}", .{num});

        const n = numberMaybeFail(num);
        if (n) |value| {
            std.debug.print("={}. ", .{value});
        } else |err| switch (err) {
            MyNumberError.TooBig => std.debug.print(">4. ", .{}),
        }
    }

    std.debug.print("\\n", .{});
}

fn numberMaybeFail(n: u8) MyNumberError!u8 {
    if (n > 4) return MyNumberError.TooBig;
    if (n < 4) return MyNumberError.TooSmall;
    return n;
}`,
      back: 'Add a prong for `TooSmall` that prints `<4. `: `MyNumberError.TooSmall => std.debug.print("<4. ", .{}),`',
      backCode: `MyNumberError.TooSmall => std.debug.print("<4. ", .{}),`,
      explanation:
        "`if (eu) |value| else |err|` captures both arms of an error union; the error arm switches over each error-set member.",
    },
    {
      id: "sw-009",
      source: "ziglings 033_iferror",
      type: "output",
      front: "What does this program print?",
      code: `const std = @import("std");

const MyNumberError = error{
    TooBig,
    TooSmall,
};

pub fn main() void {
    const nums = [_]u8{ 2, 3, 4, 5, 6 };

    for (nums) |num| {
        std.debug.print("{}", .{num});

        const n = numberMaybeFail(num);
        if (n) |value| {
            std.debug.print("={}. ", .{value});
        } else |err| switch (err) {
            MyNumberError.TooBig => std.debug.print(">4. ", .{}),
            MyNumberError.TooSmall => std.debug.print("<4. ", .{}),
        }
    }

    std.debug.print("\\n", .{});
}

fn numberMaybeFail(n: u8) MyNumberError!u8 {
    if (n > 4) return MyNumberError.TooBig;
    if (n < 4) return MyNumberError.TooSmall;
    return n;
}`,
      back: "`2<4. 3<4. 4=4. 5>4. 6>4.`",
      explanation: "4 succeeds → `=4.`; 2 and 3 return TooSmall; 5 and 6 return TooBig.",
    },
    {
      id: "sw-010",
      source: "ziglings 034_quiz4",
      type: "fix",
      front: "`main` returns `!void`, but `getNumber()` isn't being handled. What's the fix?",
      code: `const std = @import("std");

const NumError = error{IllegalNumber};

pub fn main(init: std.process.Init) !void {
    const io = init.io;
    var stdout_writer = std.Io.File.stdout().writer(io, &.{});
    const stdout = &stdout_writer.interface;

    const my_num: u32 = getNumber();

    try stdout.print("my_num={}\\n", .{my_num});
}

fn getNumber() NumError!u32 {
    if (false) return NumError.IllegalNumber;
    return 42;
}`,
      back: "Unwrap it with `try`: `const my_num: u32 = try getNumber();` — on error, `try` propagates it to `main`, which returns `!void`.",
      backCode: `const my_num: u32 = try getNumber();`,
      explanation:
        "`getNumber` returns `NumError!u32`; `try` yields the plain `u32` or returns the error up the call chain.",
    },
    {
      id: "sw-011",
      source: "ziglings 034_quiz4",
      type: "output",
      front: "What does this program print?",
      code: `const std = @import("std");

const NumError = error{IllegalNumber};

pub fn main(init: std.process.Init) !void {
    const io = init.io;
    var stdout_writer = std.Io.File.stdout().writer(io, &.{});
    const stdout = &stdout_writer.interface;

    const my_num: u32 = try getNumber();

    try stdout.print("my_num={}\\n", .{my_num});
}

fn getNumber() NumError!u32 {
    if (false) return NumError.IllegalNumber;
    return 42;
}`,
      back: "`my_num=42`",
      explanation:
        "`getNumber` returns 42 — the error branch is guarded by `if (false)` — so `try` yields 42.",
    },
  ],
};

export default deck;
