import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "functions",
  title: "Functions",
  order: 4,
  blurb: "fn, params, return, recursion",
  cards: [
    {
      id: "fn-001",
      source: "ziglings 018_functions",
      type: "fix",
      front: "What's missing from this function definition?",
      code: `const std = @import("std");

pub fn main() void {
    const answer: u8 = deepThought();

    std.debug.print("Answer to the Ultimate Question: {}\\n", .{answer});
}

??? deepThought() ??? {
    return 42;
}`,
      back: "The `fn` keyword and a return type: `fn deepThought() u8` — the function returns the number 42.",
      backCode: `fn deepThought() u8 {
    return 42;
}`,
      explanation: "`fn name() ReturnType` declares a function; the return type `u8` matches the `u8` binding in `main`.",
    },
    {
      id: "fn-002",
      source: "ziglings 018_functions",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    const answer: u8 = deepThought();

    std.debug.print("Answer to the Ultimate Question: {}\\n", .{answer});
}

fn deepThought() u8 {
    return 42;
}`,
      back: "`Answer to the Ultimate Question: 42`",
      explanation: "`deepThought()` returns 42, which is stored in `answer` and printed with `{}`.",
    },
    {
      id: "fn-003",
      source: "ziglings 018_functions",
      type: "concept",
      front: "Why is `pub` not needed on `deepThought()`?",
      back: "Functions are private by default, and `main` calls `deepThought()` from the same file — `pub` is only needed when another file must call the function.",
      explanation: "The exercise's teaching comment asks exactly this question; a private function is visible anywhere in its own file.",
    },
    {
      id: "fn-004",
      source: "ziglings 019_functions2",
      type: "fix",
      front: "What parameter does `twoToThe` take?",
      code: `const std = @import("std");

pub fn main() void {
    std.debug.print("Powers of two: {} {} {} {}\\n", .{
        twoToThe(1),
        twoToThe(2),
        twoToThe(3),
        twoToThe(4),
    });
}

fn twoToThe(???) u32 {
    return std.math.pow(u32, 2, my_number);
}`,
      back: "`fn twoToThe(my_number: u32) u32` — one parameter named `my_number` of type `u32`.",
      backCode: `fn twoToThe(my_number: u32) u32 {
    return std.math.pow(u32, 2, my_number);
}`,
      explanation: "Parameters are declared `name: type`; here `u32` matches the type `std.math.pow(u32, 2, ...)` needs. Function parameters are always `const`.",
    },
    {
      id: "fn-005",
      source: "ziglings 019_functions2",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    std.debug.print("Powers of two: {} {} {} {}\\n", .{
        twoToThe(1),
        twoToThe(2),
        twoToThe(3),
        twoToThe(4),
    });
}

fn twoToThe(my_number: u32) u32 {
    return std.math.pow(u32, 2, my_number);
}`,
      back: "`Powers of two: 2 4 8 16`",
      explanation: "`twoToThe(n)` computes 2ⁿ with `std.math.pow`: 2¹, 2², 2³, 2⁴ = 2, 4, 8, 16.",
    },
    {
      id: "fn-006",
      source: "ziglings 020_quiz3",
      type: "fix",
      front: "This function prints but returns nothing. What are the two missing pieces?",
      code: `fn printPowersOfTwo(numbers: [4]u16) ??? {
    loop (numbers) |n| {
        std.debug.print("{} ", .{twoToThe(n)});
    }
}`,
      back: "The return type is `void` (it prints, returns nothing) and `loop` must be `for`: `for (numbers) |n|`.",
      backCode: `fn printPowersOfTwo(numbers: [4]u16) void {
    for (numbers) |n| {
        std.debug.print("{} ", .{twoToThe(n)});
    }
}`,
      explanation: "Iterating an array is a `for` loop; a function that only prints has return type `void`.",
    },
    {
      id: "fn-007",
      source: "ziglings 020_quiz3",
      type: "fix",
      front: "This function doubles `total` until `n` reaches `number`. What are the three missing pieces?",
      code: `fn twoToThe(number: u16) ??? {
    var n: u16 = 0;
    var total: u16 = 1;

    loop (n < number) : (n += 1) {
        total *= 2;
    }

    return ???;
}`,
      back: "Return type `u16`, `loop` → `while`, and the value to return is `total`.",
      backCode: `fn twoToThe(number: u16) u16 {
    var n: u16 = 0;
    var total: u16 = 1;

    while (n < number) : (n += 1) {
        total *= 2;
    }

    return total;
}`,
      explanation: "The `while` loop with a continue expression doubles `total` exactly `number` times, so 2^`number` accumulates in `total`; `return total;` hands it back.",
    },
    {
      id: "fn-008",
      source: "ziglings 020_quiz3",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    const my_numbers = [4]u16{ 5, 6, 7, 8 };

    printPowersOfTwo(my_numbers);
    std.debug.print("\\n", .{});
}

fn printPowersOfTwo(numbers: [4]u16) void {
    for (numbers) |n| {
        std.debug.print("{} ", .{twoToThe(n)});
    }
}

fn twoToThe(number: u16) u16 {
    var n: u16 = 0;
    var total: u16 = 1;

    while (n < number) : (n += 1) {
        total *= 2;
    }

    return total;
}`,
      back: "`32 64 128 256`",
      explanation: "`printPowersOfTwo` calls `twoToThe` for each of 5, 6, 7, 8 — one function calling another — giving 2⁵, 2⁶, 2⁷, 2⁸ = 32, 64, 128, 256.",
    },
  ],
};

export default deck;
