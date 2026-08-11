import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "enums-structs",
  title: "Enums & structs",
  order: 7,
  blurb: "enum, struct, fields",
  section: "zig",
  cards: [
    {
      id: "es-001",
      source: "ziglings 035_enums",
      type: "fix",
      front: "Why doesn't this compile?",
      code: `// Please complete the enum!
const Ops = enum { ??? };`,
      back: "The enum has no members, so `Ops.inc`, `Ops.pow`, and `Ops.dec` don't exist. Declare them: `const Ops = enum { dec, inc, pow };`.",
      backCode: `const Ops = enum { dec, inc, pow };`,
      explanation:
        "An enum lets you give names to numeric values and store them in a set; the switch later relies on exactly these members.",
    },
    {
      id: "es-002",
      source: "ziglings 035_enums",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

// Please complete the enum!
const Ops = enum { dec, inc, pow };

pub fn main() void {
    const operations = [_]Ops{
        Ops.inc,
        Ops.inc,
        Ops.inc,
        Ops.pow,
        Ops.dec,
        Ops.dec,
    };

    var current_value: u32 = 0;

    for (operations) |op| {
        switch (op) {
            Ops.inc => {
                current_value += 1;
            },
            Ops.dec => {
                current_value -= 1;
            },
            Ops.pow => {
                current_value *= current_value;
            },
            // No "else" needed! Why is that?
        }

        std.debug.print("{} ", .{current_value});
    }

    std.debug.print("\\n", .{});
}`,
      back: "`1 2 3 9 8 7`",
      explanation:
        "Three increments give 1, 2, 3; `Ops.pow` squares 3 to 9; two decrements give 8 then 7.",
    },
    {
      id: "es-003",
      source: "ziglings 036_enums2",
      type: "fix",
      front: "What's missing from this enum?",
      code: `const Color = enum(u32) {
    red = 0xff0000,
    green = 0x00ff00,
    blue = ???,
};`,
      back: "`blue = 0x0000ff` — pure blue is zero red, zero green, full blue.",
      backCode: `const Color = enum(u32) {
    red = 0xff0000,
    green = 0x00ff00,
    blue = 0x0000ff,
};`,
      explanation:
        "Enums are really just a set of numbers: you can assign explicit values and pick the backing integer type (`u32`). `@intFromEnum()` converts a member back to that integer.",
    },
    {
      id: "es-004",
      source: "ziglings 036_enums2",
      type: "concept",
      front: "What does the format string `{x:0>6}` do?",
      back: "Prints the value as lowercase hexadecimal (`x`), zero-padded (`0`) and right-aligned (`>`) to a width of 6.",
      explanation:
        "`x` is the type, then a colon, then `0` is the padding character, `>` the alignment, and `6` the width — so `0xff` prints as `0000ff`.",
    },
    {
      id: "es-005",
      source: "ziglings 036_enums2",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

const Color = enum(u32) {
    red = 0xff0000,
    green = 0x00ff00,
    blue = 0x0000ff,
};

pub fn main() void {
    std.debug.print(
        \\\\<p>
        \\\\  <span style="color: #{x:0>6}">Red</span>
        \\\\  <span style="color: #{x:0>6}">Green</span>
        \\\\  <span style="color: #{x:0>6}">Blue</span>
        \\\\</p>
        \\\\
    , .{
        @backingInt(Color.red),
        @backingInt(Color.green),
        @backingInt(Color.blue), // Oops! We're missing something!
    });
}`,
      back: `<p>
  <span style="color: #ff0000">Red</span>
  <span style="color: #00ff00">Green</span>
  <span style="color: #0000ff">Blue</span>
</p>`,
      explanation:
        "`{x:0>6}` zero-pads each hex value to 6 digits; each color is already 6 digits, so they print as-is.",
    },
    {
      id: "es-006",
      source: "ziglings 037_structs",
      type: "fix",
      front: "What's missing from this struct?",
      code: `const Role = enum {
    wizard,
    thief,
    bard,
    warrior,
};

const Character = struct {
    role: Role,
    gold: u32,
    experience: u32,
};

pub fn main() void {
    // Please initialize Glorp with 100 health.
    var glorp_the_wise = Character{
        .role = Role.wizard,
        .gold = 20,
        .experience = 10,
    };

    // Ouch! Glorp takes a punch!
    glorp_the_wise.health -= 10;
}`,
      back: "A `health` field: `main` mutates `glorp_the_wise.health`, which can't exist without the field. Add `health: u8` to the struct and initialize Glorp with `.health = 100`.",
      backCode: `const Character = struct {
    role: Role,
    gold: u32,
    experience: u32,
    health: u8,
};`,
      explanation:
        "A struct groups values under one type; each field is accessed with `.` and must exist before it can be read or assigned.",
    },
    {
      id: "es-007",
      source: "ziglings 037_structs",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

// We'll use an enum to specify the character role.
const Role = enum {
    wizard,
    thief,
    bard,
    warrior,
};

// Please add a new property to this struct called "health" and make
// it a u8 integer type.
const Character = struct {
    role: Role,
    gold: u32,
    experience: u32,
    health: u8,
};

pub fn main() void {
    // Please initialize Glorp with 100 health.
    var glorp_the_wise = Character{
        .role = Role.wizard,
        .gold = 20,
        .experience = 10,
        .health = 100,
    };

    // Glorp gains some gold.
    glorp_the_wise.gold += 5;

    // Ouch! Glorp takes a punch!
    glorp_the_wise.health -= 10;

    std.debug.print("Your wizard has {} health and {} gold.\\n", .{
        glorp_the_wise.health,
        glorp_the_wise.gold,
    });
}`,
      back: "`Your wizard has 90 health and 25 gold.`",
      explanation:
        "Glorp starts at 100 health and 20 gold; the punch subtracts 10 and the loot adds 5, and field access `.` reads the updated values.",
    },
    {
      id: "es-008",
      source: "ziglings 038_structs2",
      type: "fix",
      front: "What's missing here?",
      code: `const std = @import("std");

const Role = enum {
    wizard,
    thief,
    bard,
    warrior,
};

const Character = struct {
    role: Role,
    gold: u32,
    health: u8,
    experience: u32,
};

pub fn main() void {
    var chars: [2]Character = undefined;

    // Glorp the Wise
    chars[0] = Character{
        .role = Role.wizard,
        .gold = 20,
        .health = 100,
        .experience = 10,
    };

    // Please add "Zump the Loud" with the following properties:
    //
    //     role       bard
    //     gold       10
    //     health     100
    //     experience 20
    //
    // Feel free to run this program without adding Zump. What does
    // it do and why?

    // Printing all RPG characters in a loop:
    for (chars, 0..) |c, num| {
        std.debug.print("Character {} - G:{} H:{} XP:{}\\n", .{
            num + 1, c.gold, c.health, c.experience,
        });
    }
}`,
      back: "`chars[1]` is never assigned, so the second Character is uninitialized. Fill it with Zump: `chars[1] = Character{ .role = Role.bard, .gold = 10, .health = 100, .experience = 20 };`.",
      backCode: `    chars[1] = Character{
        .role = Role.bard,
        .gold = 10,
        .health = 100,
        .experience = 20,
    };`,
      explanation:
        "The array holds two `Character` structs and the loop prints both; leaving a slot `undefined` means reading values that were never set.",
    },
    {
      id: "es-009",
      source: "ziglings 038_structs2",
      type: "concept",
      front: "What does Zig fill `undefined` memory with in debug mode?",
      back: 'The repeating pattern `0xAA` (10101010 in binary), so uninitialized locations show up as "garbage" values and are easy to spot while debugging.',
      explanation:
        "In debug mode (the default), Zig writes 0xAA to all `undefined` locations to make them stand out; the exercise calls this pattern the repeating binary `10101010`.",
    },
    {
      id: "es-010",
      source: "ziglings 038_structs2",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

const Role = enum {
    wizard,
    thief,
    bard,
    warrior,
};

const Character = struct {
    role: Role,
    gold: u32,
    health: u8,
    experience: u32,
};

pub fn main() void {
    var chars: [2]Character = undefined;

    // Glorp the Wise
    chars[0] = Character{
        .role = Role.wizard,
        .gold = 20,
        .health = 100,
        .experience = 10,
    };

    // Please add "Zump the Loud" with the following properties:
    //
    //     role       bard
    //     gold       10
    //     health     100
    //     experience 20
    //
    // Feel free to run this program without adding Zump. What does
    // it do and why?
    chars[1] = Character{
        .role = Role.bard,
        .gold = 10,
        .health = 100,
        .experience = 20,
    };

    // Printing all RPG characters in a loop:
    for (chars, 0..) |c, num| {
        std.debug.print("Character {} - G:{} H:{} XP:{}\\n", .{
            num + 1, c.gold, c.health, c.experience,
        });
    }
}`,
      back: `Character 1 - G:20 H:100 XP:10
Character 2 - G:10 H:100 XP:20`,
      explanation:
        "The `for` loop iterates the two structs with an index (`num`), and `num + 1` makes the numbering 1-based.",
    },
  ],
};

export default deck;
