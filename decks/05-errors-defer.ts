import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "errors-defer",
  title: "Errors & defer",
  order: 5,
  blurb: "errors, error unions, defer, errdefer",
  cards: [
    {
      id: "er-001",
      source: "ziglings 021_errors",
      type: "fix",
      front: "Why doesn't this compile?",
      code: `const MyNumberError = error{
    TooBig,
    ???,
    TooFour,
};

const std = @import("std");

pub fn main() void {
    const nums = [_]u8{ 2, 3, 4, 5, 6 };

    for (nums) |n| {
        std.debug.print("{}", .{n});

        const number_error = numberFail(n);

        if (number_error == MyNumberError.TooBig) {
            std.debug.print(">4. ", .{});
        }
        if (???) {
            std.debug.print("<4. ", .{});
        }
        if (number_error == MyNumberError.TooFour) {
            std.debug.print("=4. ", .{});
        }
    }

    std.debug.print("\\n", .{});
}

// Notice how this function can return any member of the MyNumberError
// error set.
fn numberFail(n: u8) MyNumberError {
    if (n > 4) return MyNumberError.TooBig;
    if (n < 4) return MyNumberError.TooSmall; // <---- this one is free!
    return MyNumberError.TooFour;
}`,
      back: "Two things are missing: `TooSmall` must be added to the `MyNumberError` error set, and the middle `if` needs the condition `number_error == MyNumberError.TooSmall`.",
      backCode: `const MyNumberError = error{
    TooBig,
    TooSmall,
    TooFour,
};

if (number_error == MyNumberError.TooSmall) {
    std.debug.print("<4. ", .{});
}`,
      explanation:
        "Errors are named values from an error set; you compare them with `==` like any other value.",
    },
    {
      id: "er-002",
      source: "ziglings 021_errors",
      type: "output",
      front: "What does this program print?",
      code: `const MyNumberError = error{
    TooBig,
    TooSmall,
    TooFour,
};

const std = @import("std");

pub fn main() void {
    const nums = [_]u8{ 2, 3, 4, 5, 6 };

    for (nums) |n| {
        std.debug.print("{}", .{n});

        const number_error = numberFail(n);

        if (number_error == MyNumberError.TooBig) {
            std.debug.print(">4. ", .{});
        }
        if (number_error == MyNumberError.TooSmall) {
            std.debug.print("<4. ", .{});
        }
        if (number_error == MyNumberError.TooFour) {
            std.debug.print("=4. ", .{});
        }
    }

    std.debug.print("\\n", .{});
}

fn numberFail(n: u8) MyNumberError {
    if (n > 4) return MyNumberError.TooBig;
    if (n < 4) return MyNumberError.TooSmall;
    return MyNumberError.TooFour;
}`,
      back: "`2<4. 3<4. 4=4. 5>4. 6>4.`",
      explanation:
        "2 and 3 are below 4, 4 is equal, and 5 and 6 are above. `numberFail` returns one of the three named errors, each checked by `==`.",
    },
    {
      id: "er-003",
      source: "ziglings 022_errors2",
      type: "fix",
      front: "What type must `my_number` have so it can hold either a number or an error?",
      code: `const std = @import("std");

const MyNumberError = error{TooSmall};

pub fn main() void {
    var my_number: ??? = 5;

    my_number = MyNumberError.TooSmall;

    std.debug.print("I compiled!\\n", .{});
}`,
      back: "An error union: `MyNumberError!u8` — a value that is either a `u8` or an error from the `MyNumberError` set.",
      backCode: `var my_number: MyNumberError!u8 = 5;`,
      explanation:
        '`MyErrorSet!T` reads "error set or T". The binding starts as the number `5` and is later reassigned to an error.',
    },
    {
      id: "er-004",
      source: "ziglings 023_errors3",
      type: "fix",
      front: "Two pieces are missing here. Can you spot them?",
      code: `const std = @import("std");

const MyNumberError = error{TooSmall};

pub fn main() void {
    const a: u32 = addTwenty(44) catch 22;
    const b: u32 = addTwenty(4) ??? 22;

    std.debug.print("a={}, b={}\\n", .{ a, b });
}

fn addTwenty(n: u32) ??? {
    if (n < 5) {
        return MyNumberError.TooSmall;
    } else {
        return n + 20;
    }
}`,
      back: "The second call needs `catch 22`, and `addTwenty` must return the error union `MyNumberError!u32`.",
      backCode: `const b: u32 = addTwenty(4) catch 22;

fn addTwenty(n: u32) MyNumberError!u32 {`,
      explanation:
        "`catch <default>` replaces any error with the default value, so the result type stays `u32`.",
    },
    {
      id: "er-005",
      source: "ziglings 023_errors3",
      type: "output",
      front: "What does this program print?",
      code: `const std = @import("std");

const MyNumberError = error{TooSmall};

pub fn main() void {
    const a: u32 = addTwenty(44) catch 22;
    const b: u32 = addTwenty(4) catch 22;

    std.debug.print("a={}, b={}\\n", .{ a, b });
}

fn addTwenty(n: u32) MyNumberError!u32 {
    if (n < 5) {
        return MyNumberError.TooSmall;
    } else {
        return n + 20;
    }
}`,
      back: "`a=64, b=22`",
      explanation:
        "`addTwenty(44)` succeeds (44+20=64). `addTwenty(4)` returns `TooSmall` (4 < 5), so `catch 22` supplies the default.",
    },
    {
      id: "er-006",
      source: "ziglings 024_errors4",
      type: "fix",
      front:
        "What should `fixTooSmall` do to turn TooSmall into 10 and pass through any other error?",
      code: `const MyNumberError = error{
    TooSmall,
    TooBig,
};

fn fixTooSmall(n: u32) MyNumberError!u32 {
    return detectProblems(n) ???;
}

fn detectProblems(n: u32) MyNumberError!u32 {
    if (n < 10) return MyNumberError.TooSmall;
    if (n > 20) return MyNumberError.TooBig;
    return n;
}`,
      back: "Use the `catch |err|` block form: catch the error, return 10 if it is `TooSmall`, otherwise return the error itself.",
      backCode: `fn fixTooSmall(n: u32) MyNumberError!u32 {
    return detectProblems(n) catch |err| {
        if (err == MyNumberError.TooSmall) {
            return 10;
        }

        return err;
    };
}`,
      explanation:
        "`catch |err|` captures the error value so you can branch on it, instead of blindly substituting a default.",
    },
    {
      id: "er-007",
      source: "ziglings 024_errors4",
      type: "output",
      front: "What does this program print?",
      code: `const std = @import("std");

const MyNumberError = error{
    TooSmall,
    TooBig,
};

pub fn main() void {
    const a: u32 = makeJustRight(44) catch 0;
    const b: u32 = makeJustRight(14) catch 0;
    const c: u32 = makeJustRight(4) catch 0;

    std.debug.print("a={}, b={}, c={}\\n", .{ a, b, c });
}

fn makeJustRight(n: u32) MyNumberError!u32 {
    return fixTooBig(n) catch |err| {
        return err;
    };
}

fn fixTooBig(n: u32) MyNumberError!u32 {
    return fixTooSmall(n) catch |err| {
        if (err == MyNumberError.TooBig) {
            return 20;
        }

        return err;
    };
}

fn fixTooSmall(n: u32) MyNumberError!u32 {
    return detectProblems(n) catch |err| {
        if (err == MyNumberError.TooSmall) {
            return 10;
        }

        return err;
    };
}

fn detectProblems(n: u32) MyNumberError!u32 {
    if (n < 10) return MyNumberError.TooSmall;
    if (n > 20) return MyNumberError.TooBig;
    return n;
}`,
      back: "`a=20, b=14, c=10`",
      explanation:
        "44 → TooBig → `fixTooBig` returns 20. 14 is in range so it passes through as 14. 4 → TooSmall → `fixTooSmall` returns 10.",
    },
    {
      id: "er-008",
      source: "ziglings 025_errors5",
      type: "fix",
      front: "How can `addFive` use `try` instead of an explicit catch-and-return?",
      code: `const MyNumberError = error{
    TooSmall,
    TooBig,
};

fn addFive(n: u32) MyNumberError!u32 {
    const x = detect(n);

    return x + 5;
}

fn detect(n: u32) MyNumberError!u32 {
    if (n < 10) return MyNumberError.TooSmall;
    if (n > 20) return MyNumberError.TooBig;
    return n;
}`,
      back: "Unwrap with `try`: `const x = try detect(n);` — on error it returns the error immediately, otherwise `x` is the plain value.",
      backCode: `const x = try detect(n);`,
      explanation: "`try canFail()` is shorthand for `canFail() catch |err| return err;`.",
    },
    {
      id: "er-009",
      source: "ziglings 025_errors5",
      type: "output",
      front: "What does this program print?",
      code: `const std = @import("std");

const MyNumberError = error{
    TooSmall,
    TooBig,
};

pub fn main() void {
    const a: u32 = addFive(44) catch 0;
    const b: u32 = addFive(14) catch 0;
    const c: u32 = addFive(4) catch 0;

    std.debug.print("a={}, b={}, c={}\\n", .{ a, b, c });
}

fn addFive(n: u32) MyNumberError!u32 {
    const x = try detect(n);

    return x + 5;
}

fn detect(n: u32) MyNumberError!u32 {
    if (n < 10) return MyNumberError.TooSmall;
    if (n > 20) return MyNumberError.TooBig;
    return n;
}`,
      back: "`a=0, b=19, c=0`",
      explanation:
        "44 > 20 → TooBig, so `addFive` fails and `catch 0` yields 0. 14 is in range → 19. 4 < 10 → TooSmall → 0.",
    },
    {
      id: "er-010",
      source: "ziglings 027_defer",
      type: "fix",
      front: "How do you make this print `One Two` without moving either statement?",
      code: `const std = @import("std");

pub fn main() void {
    std.debug.print("Two\\n", .{});
    std.debug.print("One ", .{});
}`,
      back: 'Defer the first print so it runs when `main` exits: `defer std.debug.print("Two\\n", .{});`',
      backCode: `defer std.debug.print("Two\\n", .{});
std.debug.print("One ", .{});`,
      explanation:
        "A `defer` runs after the enclosing scope exits, so `One ` prints first and `Two` prints last.",
    },
    {
      id: "er-011",
      source: "ziglings 027_defer",
      type: "output",
      front: "What does this program print?",
      code: `const std = @import("std");

pub fn main() void {
    defer std.debug.print("Two\\n", .{});
    std.debug.print("One ", .{});
}`,
      back: "`One Two`",
      explanation:
        "The `defer` is held until `main` exits, so `One ` prints first and `Two` prints at scope exit.",
    },
    {
      id: "er-012",
      source: "ziglings 028_defer2",
      type: "fix",
      front:
        "`printAnimal` can `return` in four different places. How do you print the closing parenthesis every time?",
      code: `const std = @import("std");

fn printAnimal(animal: u8) void {
    std.debug.print("(", .{});

    std.debug.print(") ", .{});

    if (animal == 'g') {
        std.debug.print("Goat", .{});
        return;
    }
    if (animal == 'c') {
        std.debug.print("Cat", .{});
        return;
    }
    if (animal == 'd') {
        std.debug.print("Dog", .{});
        return;
    }

    std.debug.print("Unknown", .{});
}`,
      back: 'Defer it: `defer std.debug.print(") ", .{});` — it runs at function exit no matter which `return` is taken.',
      backCode: `defer std.debug.print(") ", .{});`,
      explanation:
        "A `defer` runs when the scope exits, so even a function with many early returns runs the deferred call exactly once, at the end.",
    },
    {
      id: "er-013",
      source: "ziglings 028_defer2",
      type: "output",
      front: "What does this program print?",
      code: `const std = @import("std");

pub fn main() void {
    const animals = [_]u8{ 'g', 'c', 'd', 'd', 'g', 'z' };

    for (animals) |a| printAnimal(a);

    std.debug.print("done.\\n", .{});

    std.debug.print("Answer to everything? {d}\\n", .{calculateTheUltimateQuestionOfLife()});
}

fn printAnimal(animal: u8) void {
    std.debug.print("(", .{});

    defer std.debug.print(") ", .{});

    if (animal == 'g') {
        std.debug.print("Goat", .{});
        return;
    }
    if (animal == 'c') {
        std.debug.print("Cat", .{});
        return;
    }
    if (animal == 'd') {
        std.debug.print("Dog", .{});
        return;
    }

    std.debug.print("Unknown", .{});
}

fn calculateTheUltimateQuestionOfLife() u32 {
    var x: u32 = 100;

    {
        defer x = x * 2;
        defer x = x + 11;
        defer x = x / 10;
    }

    return x;
}`,
      back: "`(Goat) (Cat) (Dog) (Dog) (Goat) (Unknown) done.\nAnswer to everything? 42`",
      explanation:
        "Each `printAnimal` defers its closing paren to scope exit. The three `defer`s run in reverse order (÷10 → +11 → ×2), turning 100 into 42.",
    },
    {
      id: "er-014",
      source: "ziglings 028_defer2",
      type: "concept",
      front: "When a block has multiple `defer` statements, in what order do they run?",
      back: "In reverse order — the last `defer` declared runs first.",
      explanation:
        'ziglings: "When there are multiple defers in a single block, they are executed in reverse order." It matters when e.g. deinitializing containers whose elements must be deinitialized first.',
    },
    {
      id: "er-015",
      source: "ziglings 029_errdefer",
      type: "fix",
      front: "How do you make the `failed!` message print only when `makeNumber` errors?",
      code: `const std = @import("std");

var counter: u32 = 0;

const MyErr = error{ GetFail, IncFail };

fn makeNumber() MyErr!u32 {
    std.debug.print("Getting number...", .{});

    std.debug.print("failed!\\n", .{});

    var num = try getNumber();

    num = try increaseNumber(num);

    std.debug.print("got {}. ", .{num});

    return num;
}

fn getNumber() MyErr!u32 {
    return 4;
}

fn increaseNumber(n: u32) MyErr!u32 {
    if (counter > 0) return MyErr.IncFail;

    counter += 1;

    return n + 1;
}`,
      back: 'Use `errdefer`: `errdefer std.debug.print("failed!\\n", .{});` — it runs only if the scope returns an error.',
      backCode: `errdefer std.debug.print("failed!\\n", .{});`,
      explanation:
        "`errdefer` is like `defer`, but fires only when the enclosing scope exits with an error.",
    },
    {
      id: "er-016",
      source: "ziglings 029_errdefer",
      type: "output",
      front: "What does this program print?",
      code: `const std = @import("std");

var counter: u32 = 0;

const MyErr = error{ GetFail, IncFail };

pub fn main() void {
    const a: u32 = makeNumber() catch return;
    const b: u32 = makeNumber() catch return;

    std.debug.print("Numbers: {}, {}\\n", .{ a, b });
}

fn makeNumber() MyErr!u32 {
    std.debug.print("Getting number...", .{});

    errdefer std.debug.print("failed!\\n", .{});

    var num = try getNumber();

    num = try increaseNumber(num);

    std.debug.print("got {}. ", .{num});

    return num;
}

fn getNumber() MyErr!u32 {
    return 4;
}

fn increaseNumber(n: u32) MyErr!u32 {
    if (counter > 0) return MyErr.IncFail;

    counter += 1;

    return n + 1;
}`,
      back: "`Getting number...got 5. Getting number...failed!`",
      explanation:
        "First call succeeds (4 → increaseNumber → 5). Second call: `increaseNumber` fails (counter > 0), so the `errdefer` fires before `main`'s `catch return` quits.",
    },
  ],
};

export default deck;
