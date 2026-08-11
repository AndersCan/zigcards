import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "stack-heap",
  title: "Stack & heap",
  order: 2,
  section: "prerequisites",
  blurb: "call frames, lifetimes, the heap, the garbage collector",
  cards: [
    {
      id: "mem-101",
      source: "prereq stack-heap",
      type: "concept",
      front: "What is the call stack?",
      back: "The region of memory where function calls live. Each call pushes a frame holding its local variables; the frame is popped when the call returns.",
      explanation:
        "Because frames are allocated automatically on entry and cleaned up on exit, stack memory needs no manual management — it's 'automatic' storage.",
    },
    {
      id: "mem-102",
      source: "prereq stack-heap",
      type: "concept",
      front: "In what order do stack frames get popped?",
      back: "LIFO — last called, first returned. The most recent call's frame is always on top and is always the next to go.",
      explanation:
        "This discipline is why local variables are born at call time and die at return: their lifetime is exactly the function call.",
    },
    {
      id: "mem-103",
      source: "prereq stack-heap",
      type: "concept",
      front: "Why can infinite recursion crash JavaScript?",
      back: "Every recursive call pushes a new stack frame; if nothing returns, the stack grows until it hits its fixed limit — JS throws 'Maximum call stack size exceeded'.",
      explanation:
        "A plain loop doesn't grow the stack because it reuses the same frame. 'Stack overflow' is the same exhaustion in any language without a GC-growing stack.",
    },
    {
      id: "mem-104",
      source: "prereq stack-heap",
      type: "concept",
      front: "What is the heap?",
      back: "A large pool of memory separate from the stack, allocated on demand. It holds data that must outlive the function that created it.",
      explanation:
        "You ask for a chunk ('allocate'), use it, and later give it back ('free'). The stack can't do this — its frames die at return.",
    },
    {
      id: "mem-105",
      source: "prereq stack-heap",
      type: "concept",
      front: "Stack vs heap: what's the tradeoff?",
      back: "Stack: fast and automatic, but fixed-size and short-lived (dies at function return). Heap: flexible and long-lived, but you must allocate and free it yourself.",
      explanation:
        "Most programs use the stack for small, short-lived locals and the heap for data whose size or lifetime isn't known ahead of time.",
    },
    {
      id: "mem-106",
      source: "prereq stack-heap",
      type: "concept",
      front: "Where do JavaScript objects live?",
      back: "On the heap. When a function returns an object, the object survives because it's heap-allocated; only the stack frame dies.",
      explanation:
        "Your code returns objects freely without thinking — the engine allocates them on the heap and the GC reclaims them later.",
    },
    {
      id: "mem-107",
      source: "prereq stack-heap",
      type: "concept",
      front: "What does a garbage collector do?",
      back: "It tracks heap objects, finds the ones nothing references anymore, and frees them. This is the memory management JS does for you.",
      explanation:
        "The cost: GC runs on its own schedule, pausing your code and making allocation cost unpredictable — things you never see in JS but that motivate C and Zig's explicit memory.",
    },
    {
      id: "mem-108",
      source: "prereq stack-heap",
      type: "concept",
      front: "Why does Zig make you think about memory?",
      back: "Zig has no garbage collector: you choose where memory comes from (the stack, or a heap allocator) and when to free it.",
      explanation:
        "Get the lifetime wrong and you get dangling pointers or leaks — crashes and bugs a JavaScript developer has never had to reason about.",
    },
  ],
};

export default deck;
