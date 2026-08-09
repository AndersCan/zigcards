import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "pointers",
  title: "Pointers",
  order: 8,
  blurb: "&, *, pointer captures",
  cards: [
    {
      id: "pt-001",
      source: "ziglings 039_pointers",
      type: "fix",
      front: "What expression makes `num2` equal 5 using `num1_pointer`?",
      code: `pub fn main() void {
    var num1: u8 = 5;
    const num1_pointer: *u8 = &num1;

    var num2: u8 = undefined;

    // Please make num2 equal 5 using num1_pointer!
    // (See the "cheatsheet" above for ideas.)
    num2 = ???;

    std.debug.print("num1: {}, num2: {}\\n", .{ num1, num2 });
}`,
      back: "`num2 = num1_pointer.*;` — `.*` dereferences the pointer to read the value it points to (5).",
      backCode: `num2 = num1_pointer.*;`,
      explanation:
        "`&num1` is a reference (a pointer) to the memory holding num1; `num1_pointer.*` is the value at that address. Dereferencing copies the value out.",
    },
    {
      id: "pt-002",
      source: "ziglings 039_pointers",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    var num1: u8 = 5;
    const num1_pointer: *u8 = &num1;

    var num2: u8 = undefined;

    // Please make num2 equal 5 using num1_pointer!
    // (See the "cheatsheet" above for ideas.)
    num2 = num1_pointer.*;

    std.debug.print("num1: {}, num2: {}\\n", .{ num1, num2 });
}`,
      back: "`num1: 5, num2: 5`",
      explanation:
        "`num2` is assigned a copy of the value stored at `num1_pointer`; the pointer itself is never assigned, only dereferenced.",
    },
    {
      id: "pt-003",
      source: "ziglings 040_pointers2",
      type: "fix",
      front: "Why doesn't this compile?",
      code: `pub fn main() void {
    const a: u8 = 12;
    const b: *u8 = &a; // fix this!

    std.debug.print("a: {}, b: {}\\n", .{ a, b.* });
}`,
      back: "`a` is `const`, so `&a` is a `*const u8` — a pointer to immutable data. Claiming it as `*u8` would promise the value is mutable, which Zig forbids.",
      backCode: `const b: *const u8 = &a;`,
      explanation:
        "Variable pointers and constant pointers are different types: you can always make a const pointer to a mutable value (var), but never a mutable pointer to an immutable value (const).",
    },
    {
      id: "pt-004",
      source: "ziglings 040_pointers2",
      type: "output",
      front: "What does this print?",
      code: `pub fn main() void {
    const a: u8 = 12;
    const b: *const u8 = &a; // fix this!

    std.debug.print("a: {}, b: {}\\n", .{ a, b.* });
}`,
      back: "`a: 12, b: 12`",
      explanation: "`b.*` dereferences the pointer, yielding the value 12 stored in `a`.",
    },
    {
      id: "pt-005",
      source: "ziglings 041_pointers3",
      type: "fix",
      front:
        "Define pointer `p` so it can point to EITHER `foo` or `bar` AND change the value it points to.",
      code: `pub fn main() void {
    var foo: u8 = 5;
    var bar: u8 = 10;

    // Please define pointer "p" so that it can point to EITHER foo or
    // bar AND change the value it points to!
    ??? p: ??? = undefined;

    p = &foo;
    p.* += 1;
    p = &bar;
    p.* += 1;
    std.debug.print("foo={}, bar={}\\n", .{ foo, bar });
}`,
      back: "`var p: *u8 = undefined;` — `*u8` because it must write through the pointer, and `var` because `p` itself gets repointed to both `foo` and `bar`.",
      backCode: `var p: *u8 = undefined;`,
      explanation:
        "`p.* += 1` mutates the pointed-to value, and `p = &bar` later changes what the pointer points to — so the pointer needs to be a mutable `var`.",
    },
    {
      id: "pt-006",
      source: "ziglings 041_pointers3",
      type: "output",
      front: "What does this print?",
      code: `pub fn main() void {
    var foo: u8 = 5;
    var bar: u8 = 10;

    // Please define pointer "p" so that it can point to EITHER foo or
    // bar AND change the value it points to!
    var p: *u8 = undefined;

    p = &foo;
    p.* += 1;
    p = &bar;
    p.* += 1;
    std.debug.print("foo={}, bar={}\\n", .{ foo, bar });
}`,
      back: "`foo=6, bar=11`",
      explanation:
        "First `p` points at `foo` and increments it to 6; then `p` is repointed at `bar` and increments it to 11.",
    },
    {
      id: "pt-007",
      source: "ziglings 041_pointers3",
      type: "concept",
      front:
        "In `var p: *u8`, what does the `var` control — the pointer itself or the value it points to?",
      back: "The pointer itself: whether `p` may be changed to point at something else. The `*u8` part controls whether the pointed-to value can change.",
      code: `//     const p3: *u8 = &unlocked;
//     var   p4: *u8 = &unlocked;`,
      explanation:
        "Both p3 and p4 can change the value at `unlocked`, but only the `var` p4 can be repointed — the pointer's mutability and the pointee's mutability are separate.",
    },
    {
      id: "pt-008",
      source: "ziglings 042_pointers4",
      type: "fix",
      front: "What goes in the body of `makeFive`?",
      code: `// This function should take a reference to a u8 value and set it
// to 5.
fn makeFive(x: *u8) void {
    ??? = 5; // fix me!
}`,
      back: "`x.* = 5;` — the parameter is a pointer to a `u8`, so the function must dereference it to write the caller's variable.",
      backCode: `fn makeFive(x: *u8) void {
    x.* = 5; // fix me!
}`,
      explanation:
        "Passing `&num` lets `makeFive` change `num` itself. Pass by reference when you want to change the pointed-to value; otherwise pass the value.",
    },
    {
      id: "pt-009",
      source: "ziglings 042_pointers4",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    var num: u8 = 1;
    var more_nums = [_]u8{ 1, 1, 1, 1 };

    // Let's pass the num reference to our function and print it:
    makeFive(&num);
    std.debug.print("num: {}, ", .{num});

    // Now something interesting. Let's pass a reference to a
    // specific array value:
    makeFive(&more_nums[2]);

    // And print the array:
    std.debug.print("more_nums: ", .{});
    for (more_nums) |n| {
        std.debug.print("{} ", .{n});
    }

    std.debug.print("\\n", .{});
}

// This function should take a reference to a u8 value and set it
// to 5.
fn makeFive(x: *u8) void {
    x.* = 5; // fix me!
}`,
      back: "`num: 5, more_nums: 1 1 5 1`",
      explanation:
        "`makeFive` sets `num` to 5, and `&more_nums[2]` targets the third array element, leaving the other three ones untouched.",
    },
    {
      id: "pt-010",
      source: "ziglings 043_pointers5",
      type: "fix",
      front: "What's the missing call?",
      code: `pub fn main() void {
    var mighty_krodor = Character{
        .class = Class.wizard,
        .gold = 10000,
        .experience = 2340,
    };

    var glorp = Character{ // Glorp!
        .class = Class.wizard,
        .gold = 10,
        .experience = 20,
        .mentor = &mighty_krodor, // Glorp's mentor is the Mighty Krodor
    };

    // FIX ME!
    // Please pass Glorp to printCharacter():
    printCharacter(???);
}`,
      back: "`printCharacter(&glorp);` — the function takes a `*Character`, so pass the address of the struct, not the struct itself.",
      backCode: `printCharacter(&glorp);`,
      explanation:
        "Inside the function, fields are accessed directly through the pointer (`c.gold`, not `c.*.gold`), and `c.mentor` links Glorp to its mentor.",
    },
    {
      id: "pt-011",
      source: "ziglings 043_pointers5",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

const Class = enum {
    wizard,
    thief,
    bard,
    warrior,
};

const Character = struct {
    class: Class,
    gold: u32,
    health: u8 = 100, // You can provide default values
    experience: u32,

    // I need to use the '?' here to allow for a null value. But
    // I don't explain it until later. Please don't tell anyone.
    mentor: ?*Character = null,
};

pub fn main() void {
    var mighty_krodor = Character{
        .class = Class.wizard,
        .gold = 10000,
        .experience = 2340,
    };

    var glorp = Character{ // Glorp!
        .class = Class.wizard,
        .gold = 10,
        .experience = 20,
        .mentor = &mighty_krodor, // Glorp's mentor is the Mighty Krodor
    };

    // FIX ME!
    // Please pass Glorp to printCharacter():
    printCharacter(&glorp);
}

// Note how this function's "c" parameter is a pointer to a Character struct.
fn printCharacter(c: *Character) void {
    // Here's something you haven't seen before: when switching an enum, you
    // don't have to write the full enum name. Zig understands that ".wizard"
    // means "Class.wizard" when we switch on a Class enum value:
    const class_name = switch (c.class) {
        .wizard => "Wizard",
        .thief => "Thief",
        .bard => "Bard",
        .warrior => "Warrior",
    };

    std.debug.print("{s} (G:{} H:{} XP:{})\\n", .{
        class_name,
        c.gold,
        c.health,
        c.experience,
    });

    // Checking an "optional" value and capturing it will be
    // explained later (this pairs with the '?' mentioned above.)
    if (c.mentor) |mentor| {
        std.debug.print("  Mentor: ", .{});
        printCharacter(mentor);
    }
}`,
      back: `Wizard (G:10 H:100 XP:20)
  Mentor: Wizard (G:10000 H:100 XP:2340)`,
      explanation:
        "Glorp's `health` defaults to 100 because struct fields can have default values, and the optional `mentor` pointer recursively prints the Mighty Krodor.",
    },
    {
      id: "pt-012",
      source: "ziglings 044_quiz5",
      type: "fix",
      front: "This quiz builds a circular chain of elephants. What's missing?",
      code: `const Elephant = struct {
    letter: u8,
    tail: *Elephant = undefined,
    visited: bool = false,
};

pub fn main() void {
    var elephantA = Elephant{ .letter = 'A' };
    // (Please add Elephant B here!)
    var elephantC = Elephant{ .letter = 'C' };

    // Link the elephants so that each tail "points" to the next elephant.
    // They make a circle: A->B->C->A...
    elephantA.tail = &elephantB;
    // (Please link Elephant B's tail to Elephant C here!)
    elephantC.tail = &elephantA;

    visitElephants(&elephantA);

    std.debug.print("\\n", .{});
}`,
      back: "Elephant B is never declared and never linked. Add `var elephantB = Elephant{ .letter = 'B' };` and `elephantB.tail = &elephantC;` to close the circle A→B→C→A.",
      backCode: `    var elephantB = Elephant{ .letter = 'B' };
    var elephantC = Elephant{ .letter = 'C' };

    // Link the elephants so that each tail "points" to the next elephant.
    // They make a circle: A->B->C->A...
    elephantA.tail = &elephantB;
    // (Please link Elephant B's tail to Elephant C here!)
    elephantB.tail = &elephantC;`,
      explanation:
        "Each `tail` is a `*Elephant`, so `&elephantB` and `&elephantC` need real variables to point at; the `visited` flag stops the walk from looping forever.",
    },
    {
      id: "pt-013",
      source: "ziglings 044_quiz5",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

const Elephant = struct {
    letter: u8,
    tail: *Elephant = undefined,
    visited: bool = false,
};

pub fn main() void {
    var elephantA = Elephant{ .letter = 'A' };
    // (Please add Elephant B here!)
    var elephantB = Elephant{ .letter = 'B' };
    var elephantC = Elephant{ .letter = 'C' };

    // Link the elephants so that each tail "points" to the next elephant.
    // They make a circle: A->B->C->A...
    elephantA.tail = &elephantB;
    // (Please link Elephant B's tail to Elephant C here!)
    elephantB.tail = &elephantC;
    elephantC.tail = &elephantA;

    visitElephants(&elephantA);

    std.debug.print("\\n", .{});
}

// This function visits all elephants once, starting with the
// first elephant and following the tails to the next elephant.
// If we did not "mark" the elephants as visited (by setting
// visited=true), then this would loop infinitely!
fn visitElephants(first_elephant: *Elephant) void {
    var e = first_elephant;

    while (!e.visited) {
        std.debug.print("Elephant {u}. ", .{e.letter});
        e.visited = true;
        e = e.tail;
    }
}`,
      back: "`Elephant A. Elephant B. Elephant C.`",
      explanation:
        "The walk follows `tail` pointers through the circle, marking each elephant visited; it stops when it reaches A again because A is already visited.",
    },
  ],
};

export default deck;
