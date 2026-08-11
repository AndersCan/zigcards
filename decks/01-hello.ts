import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "hello",
  title: "Hello, Zig",
  order: 1,
  blurb: "entry point, imports, std.debug.print",
  section: "zig",
  cards: [
    {
      id: "hl-001",
      source: "ziglings 001_hello",
      type: "fix",
      front: "Why doesn't this program compile?",
      code: `const std = @import("std");

fn main() void {
    std.debug.print("Hello world!\\n", .{});
}`,
      back: "`main` must be public: `pub fn main() void`. Zig functions are private by default, and the entry point must be visible to the linker.",
      backCode: `pub fn main() void {
    std.debug.print("Hello world!\\n", .{});
}`,
    },
    {
      id: "hl-002",
      source: "ziglings 001_hello",
      type: "output",
      front: "What does this print?",
      code: `const std = @import("std");

pub fn main() void {
    std.debug.print("Hello world!\\n", .{});
}`,
      back: "`Hello world!`",
      explanation:
        "`std.debug.print` takes a format string and an anonymous list literal of arguments; `{s}` formats a string, `{d}` an integer.",
    },
    {
      id: "hl-003",
      source: "ziglings 002_std",
      type: "fix",
      front: "What's missing here?",
      code: `??? = @import("std");

pub fn main() void {
    std.debug.print("Standard Library.\\n", .{});
}`,
      back: 'The import needs a binding: `const std = @import("std");`',
      explanation:
        "`@import` returns the imported module as a value; by convention you bind it to a `const` with the same name.",
    },
    {
      id: "hl-004",
      source: "ziglings 002_std",
      type: "concept",
      front: 'Why must imports be `const` (e.g. `const std = @import("std");`)?',
      back: "Imports are only usable at compile time, and `const` values are evaluated at compile time.",
      explanation:
        "Zig evaluates `const` initializers at comptime; a `var` binding wouldn't make sense for something that only exists during compilation.",
    },
  ],
};

export default deck;
