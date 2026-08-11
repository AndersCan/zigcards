import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "values",
  title: "Values: types, arrays, strings",
  order: 2,
  blurb: "const/var, signed & unsigned ints, arrays, strings",
  section: "zig",
  cards: [
    {
      id: "vl-001",
      source: "ziglings 003_assignment",
      type: "fix",
      front: "This program has three type errors. Can you spot them?",
      code: `const std = @import("std");

pub fn main() void {
    const n: u8 = 50;
    n = n + 5;

    const pi: u8 = 314159;

    const negative_eleven: u8 = -11;

    std.debug.print("{} {} {}\\n", .{ n, pi, negative_eleven });
}`,
      back: "1) `n` is reassigned, so it must be `var`. 2) `314159` doesn't fit in `u8` — widen it to `u32`. 3) `u8` is unsigned and can't hold `-11` — use `i8`.",
      backCode: `var n: u8 = 50;
n = n + 5;

const pi: u32 = 314159;

const negative_eleven: i8 = -11;`,
      explanation:
        "`const` cannot be reassigned; `u` types are unsigned (0–255 for `u8`); `i8` is signed (−128–127).",
    },
    {
      id: "vl-002",
      source: "ziglings 003_assignment",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    var n: u8 = 50;
    n = n + 5;

    const pi: u32 = 314159;

    const negative_eleven: i8 = -11;

    std.debug.print("{} {} {}\\n", .{ n, pi, negative_eleven });
}`,
      back: "`55 314159 -11`",
      explanation: "`{}` is the default placeholder and prints each value with default formatting.",
    },
    {
      id: "vl-003",
      source: "ziglings 003_assignment",
      type: "concept",
      front: "What's the difference between `u8`, `i8`, and `u16`?",
      back: "`u8` is unsigned 8-bit (0–255); `i8` is signed 8-bit (−128–127); `u16` is unsigned 16-bit (0–65,535).",
      explanation: "`u` = unsigned (no negatives), `i` = signed; the number is the bit width.",
    },
    {
      id: "vl-004",
      source: "ziglings 004_arrays",
      type: "fix",
      front: "Why doesn't this compile? (There are three problems.)",
      code: `const std = @import("std");

pub fn main() void {
    const some_primes = [_]u8{ 1, 3, 5, 7, 11, 13, 17, 19 };

    some_primes[0] = 2;

    const first = some_primes[0];
    const fourth = some_primes[???];
    const length = some_primes.???;

    std.debug.print("First: {}, Fourth: {}, Length: {}\\n", .{
        first, fourth, length,
    });
}`,
      back: "1) The array is mutated, so `const` must be `var`. 2) `some_primes[???]` → `some_primes[3]` (0-based indexing). 3) `some_primes.???` → `some_primes.len`.",
      backCode: `var some_primes = [_]u8{ 1, 3, 5, 7, 11, 13, 17, 19 };
some_primes[0] = 2;
const fourth = some_primes[3];
const length = some_primes.len;`,
      explanation:
        "`const` arrays can't be modified. `[index]` reads or writes one element; `.len` gives the length.",
    },
    {
      id: "vl-005",
      source: "ziglings 004_arrays",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    var some_primes = [_]u8{ 1, 3, 5, 7, 11, 13, 17, 19 };
    some_primes[0] = 2;

    const first = some_primes[0];
    const fourth = some_primes[3];
    const length = some_primes.len;

    std.debug.print("First: {}, Fourth: {}, Length: {}\\n", .{
        first, fourth, length,
    });
}`,
      back: "`First: 2, Fourth: 7, Length: 8`",
      explanation:
        "`some_primes[0] = 2` replaced the 1; `[3]` is the 4th element (value 7); `.len` is 8.",
    },
    {
      id: "vl-006",
      source: "ziglings 005_arrays2",
      type: "fix",
      front: "What completes the array concatenation and the repeated bit pattern?",
      code: `const le = [_]u8{ 1, 3 };
const et = [_]u8{ 3, 7 };

const leet = ???;

const bit_pattern_unit = ???;
const len = ???;`,
      back: "`const leet = le ++ et;` gives `{ 1, 3, 3, 7 }`. `const bit_pattern_unit = [_]u8{ 1, 0, 0, 1 };` and `const len = 3 * bit_pattern_unit.len;` produce the 12-bit pattern.",
      explanation:
        "`++` concatenates two arrays into a new array; `[_]u8{...}` lets Zig infer the length from the literal.",
    },
    {
      id: "vl-007",
      source: "ziglings 005_arrays2",
      type: "concept",
      front: "When is the `++` array operator evaluated?",
      back: "Only at compile time — `++` on arrays is evaluated during compilation (comptime), not at runtime.",
      explanation:
        "ziglings calls `++` the one array operator; it's a comptime feature that produces a new array type.",
    },
    {
      id: "vl-008",
      source: "ziglings 006_strings",
      type: "fix",
      front: "What are the missing expressions?",
      code: `const ziggy = "stardust";

const d: u8 = ziggy[???];

const major = "Major";
const tom = "Tom";
const major_tom = major ??? tom;`,
      back: '`ziggy[4]` is the `\'d\'` (0-based: s-t-a-r-d), and `major ++ " " ++ tom` builds `"Major Tom"`.',
      explanation:
        "Strings are arrays of bytes, so `[]` indexing and `++` work on them like on any array.",
    },
    {
      id: "vl-009",
      source: "ziglings 006_strings",
      type: "concept",
      front: "What's the difference between `'H'` and `\"H\"` in Zig?",
      back: "`'H'` is a character literal (a single byte value); `\"H\"` is a string literal (an array of bytes). They are not interchangeable.",
      explanation: "Characters use single quotes, strings use double quotes.",
    },
    {
      id: "vl-010",
      source: "ziglings 006_strings",
      type: "concept",
      front: "Why does printing a `u8` byte with `{u}` show a letter instead of a number?",
      back: "`{u}` formats the byte as a UTF-8 character — the byte 100 prints as `d` — while `{d}` would print the decimal value `100`.",
      explanation:
        "`{u}` = Unicode character, `{s}` = string, `{d}` = decimal integer, `{}` = default.",
    },
    {
      id: "vl-011",
      source: "ziglings 007_strings2",
      type: "concept",
      front: "How do you write a multi-line string literal in Zig?",
      back: "Prefix every line with `\\\\` (two backslashes), like a comment but with backslashes.",
      code: `const lyrics =
    \\\\Ziggy played guitar
    \\\\Jamming good with Andrew Kelley
    \\\\And the Spiders from Mars
;`,
      explanation:
        "Multiline string literals have no escape sequences and run line-by-line; each line must start with `\\\\`.",
    },
    {
      id: "vl-012",
      source: "ziglings 008_quiz",
      type: "fix",
      front: "This quiz has several bugs. The goal: print `Program in Zig!`",
      code: `const std = @import("std");

const letters = "YZhifg";

const x: usize = 1;
var lang: [3]u8 = undefined;

lang[0] = letters[x];
x = 3;
lang[???] = letters[x];
x = ???;
lang[2] = letters[???];

std.debug.print("Program in {s}!\\n", .{lang});`,
      back: "`x` must be `var` (it's reassigned). Then `lang[1] = letters[x]` with `x = 3`, and `x = 5; lang[2] = letters[5]` — indexing `letters` at 1, 3, 5 gives 'Z', 'i', 'g'.",
      explanation:
        "`usize` is the idiomatic index type; `undefined` lets you declare an array without initializing it.",
    },
  ],
};

export default deck;
