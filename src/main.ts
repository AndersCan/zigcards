import type { Deck } from "./types.ts";
import deckMemoryBasics from "../decks/00-memory-basics.ts";
import deckStackHeap from "../decks/00-stack-heap.ts";
import deckHello from "../decks/01-hello.ts";
import deckValues from "../decks/02-values.ts";
import deckControlFlow from "../decks/03-control-flow.ts";
import deckFunctions from "../decks/04-functions.ts";
import deckErrorsDefer from "../decks/05-errors-defer.ts";
import deckSwitch from "../decks/06-switch-unreachable.ts";
import deckEnumsStructs from "../decks/07-enums-structs.ts";
import deckPointers from "../decks/08-pointers.ts";
import deckOptionals from "../decks/09-optionals.ts";
import deckMojo from "../decks/10-mojo.ts";

const decks: Deck[] = [
  deckMemoryBasics,
  deckStackHeap,
  deckHello,
  deckValues,
  deckControlFlow,
  deckFunctions,
  deckErrorsDefer,
  deckSwitch,
  deckEnumsStructs,
  deckPointers,
  deckOptionals,
  deckMojo,
];

window.ZigCards = { decks };

import "./app.ts";
