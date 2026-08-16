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
import deckUrduGreetings from "../decks/00-urdu-greetings.ts";
import deckUrduPoliteness from "../decks/01-urdu-politeness.ts";
import deckUrduIntroductions from "../decks/02-urdu-introductions.ts";
import deckUrduQuestions from "../decks/03-urdu-questions.ts";
import deckUrduNumbers from "../decks/04-urdu-numbers.ts";
import deckUrduTime from "../decks/05-urdu-time.ts";
import deckUrduFood from "../decks/06-urdu-food.ts";
import deckUrduShopping from "../decks/07-urdu-shopping.ts";
import deckUrduDirections from "../decks/08-urdu-directions.ts";
import deckUrduEmergencies from "../decks/09-urdu-emergencies.ts";
import deckUrduFeelings from "../decks/10-urdu-feelings.ts";

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
  deckUrduGreetings,
  deckUrduPoliteness,
  deckUrduIntroductions,
  deckUrduQuestions,
  deckUrduNumbers,
  deckUrduTime,
  deckUrduFood,
  deckUrduShopping,
  deckUrduDirections,
  deckUrduEmergencies,
  deckUrduFeelings,
];

window.ZigCards = { decks };

import "./app.ts";
