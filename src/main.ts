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
import deckUrduGreetingsWords from "../decks/00-urdu-greetings-words.ts";
import deckUrduGreetings from "../decks/01-urdu-greetings.ts";
import deckUrduPolitenessWords from "../decks/02-urdu-politeness-words.ts";
import deckUrduPoliteness from "../decks/03-urdu-politeness.ts";
import deckUrduIntroductionsWords from "../decks/04-urdu-introductions-words.ts";
import deckUrduIntroductions from "../decks/05-urdu-introductions.ts";
import deckUrduQuestionsWords from "../decks/06-urdu-questions-words.ts";
import deckUrduQuestions from "../decks/07-urdu-questions.ts";
import deckUrduNumbersWords from "../decks/08-urdu-numbers-words.ts";
import deckUrduNumbers from "../decks/09-urdu-numbers.ts";
import deckUrduTimeWords from "../decks/10-urdu-time-words.ts";
import deckUrduTime from "../decks/11-urdu-time.ts";
import deckUrduFoodWords from "../decks/12-urdu-food-words.ts";
import deckUrduFood from "../decks/13-urdu-food.ts";
import deckUrduShoppingWords from "../decks/14-urdu-shopping-words.ts";
import deckUrduShopping from "../decks/15-urdu-shopping.ts";
import deckUrduDirectionsWords from "../decks/16-urdu-directions-words.ts";
import deckUrduDirections from "../decks/17-urdu-directions.ts";
import deckUrduEmergenciesWords from "../decks/18-urdu-emergencies-words.ts";
import deckUrduEmergencies from "../decks/19-urdu-emergencies.ts";
import deckUrduFeelingsWords from "../decks/20-urdu-feelings-words.ts";
import deckUrduFeelings from "../decks/21-urdu-feelings.ts";

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
  deckUrduGreetingsWords,
  deckUrduGreetings,
  deckUrduPolitenessWords,
  deckUrduPoliteness,
  deckUrduIntroductionsWords,
  deckUrduIntroductions,
  deckUrduQuestionsWords,
  deckUrduQuestions,
  deckUrduNumbersWords,
  deckUrduNumbers,
  deckUrduTimeWords,
  deckUrduTime,
  deckUrduFoodWords,
  deckUrduFood,
  deckUrduShoppingWords,
  deckUrduShopping,
  deckUrduDirectionsWords,
  deckUrduDirections,
  deckUrduEmergenciesWords,
  deckUrduEmergencies,
  deckUrduFeelingsWords,
  deckUrduFeelings,
];

window.ZigCards = { decks };

import "./app.ts";
