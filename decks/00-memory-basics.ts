import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "memory-basics",
  title: "Memory basics",
  order: 1,
  section: "prerequisites",
  blurb: "bits, bytes, addresses, values vs references",
  cards: [
    {
      id: "mem-001",
      source: "prereq memory-basics",
      type: "concept",
      front: "What is a bit?",
      back: "The smallest unit of memory: a single 0 or 1. Everything stored in a computer is ultimately bits.",
      explanation:
        "One bit can't hold much — it only distinguishes two states. Meaningful data needs groups of bits.",
    },
    {
      id: "mem-002",
      source: "prereq memory-basics",
      type: "concept",
      front: "What is a byte?",
      back: "8 bits. It's the standard unit of memory: one ASCII character fits in one byte, and it's the smallest chunk of memory a CPU typically addresses.",
      explanation: "A `u8` in Zig is exactly this — an 8-bit value taking up one byte of memory.",
    },
    {
      id: "mem-003",
      source: "prereq memory-basics",
      type: "concept",
      front: "How is RAM organized?",
      back: "Like a huge array of bytes, each with its own numeric address. Reading or writing a value means going to its address.",
      explanation:
        "There is no 'the number 5' floating around — it lives at some byte (or group of bytes) at some address.",
    },
    {
      id: "mem-004",
      source: "prereq memory-basics",
      type: "concept",
      front: "What is an address?",
      back: "A number that identifies a specific byte's location in memory — like an index into RAM. JavaScript hides them; Zig exposes them (`&num` is 'the address of `num`').",
      explanation:
        "Pointers in Zig are just values that hold an address, plus a type saying what lives there.",
    },
    {
      id: "mem-005",
      source: "prereq memory-basics",
      type: "concept",
      front: "Why are addresses written in hex, like `0x7fff...`?",
      back: "Because two hex digits encode exactly one byte, so a hex address maps neatly onto memory layout. It's also much shorter than a long decimal number.",
      explanation:
        "`0xFF` is the same as 255 decimal: 8 bits, one byte, two hex digits. Hex is just a convenient notation.",
    },
    {
      id: "mem-006",
      source: "prereq memory-basics",
      type: "concept",
      front: "In JS, does `let b = a` copy the value when `a` is a number?",
      back: "Yes. Numbers copy by value: `let a = 5; let b = a; b = 6;` leaves `a` at 5. Each variable holds its own copy of the number.",
      explanation:
        "Zig behaves the same way for plain values: assigning copies the bytes. No sharing happens unless you use a pointer.",
    },
    {
      id: "mem-007",
      source: "prereq memory-basics",
      type: "concept",
      front: "In JS, does `const b = a` copy when `a` is an object?",
      back: "No. It copies the reference: `a` and `b` now point to the same object in memory, so mutating one is visible through the other.",
      explanation:
        "That reference is JavaScript's hidden pointer. Zig makes it explicit: a pointer is just a reference you can take with `&`, store, and pass around — and see the address of.",
    },
    {
      id: "mem-008",
      source: "prereq memory-basics",
      type: "concept",
      front: "Why does memory care about a value's type and size?",
      back: "Because memory is measured in bytes, a program must know how many bytes each value occupies: a `u8` takes 1 byte, a `u32` takes 4, a struct takes the sum of its fields.",
      explanation:
        "This is why Zig demands explicit types: the compiler needs sizes and layouts to place values in memory. JS infers all of this for you at runtime.",
    },
  ],
};

export default deck;
