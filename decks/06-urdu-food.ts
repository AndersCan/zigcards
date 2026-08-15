import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "urdu-food",
  title: "Urdu: food & drink",
  order: 6,
  blurb: "Ordering food and talking about meals",
  section: "urdu",
  cards: [
    {
      id: "ur-060",
      source: "urdu food",
      type: "concept",
      front: "How do you say 'water' in Urdu?",
      back: "پانی — paani",
      explanation:
        "One of the first words every visitor picks up. Ask for 'thanda paani' for cold water.",
    },
    {
      id: "ur-061",
      source: "urdu food",
      type: "concept",
      front: "How do you say 'tea' in Urdu?",
      back: "چائے — chai",
      explanation:
        "The national drink — usually milky and sweet unless you ask for 'bila chini' (no sugar).",
    },
    {
      id: "ur-062",
      source: "urdu food",
      type: "concept",
      front: "How do you say 'bread' in Urdu?",
      back: "روٹی — roti",
      explanation: "Flatbread baked in a tandoor or on a griddle — the staple at most meals.",
    },
    {
      id: "ur-063",
      source: "urdu food",
      type: "concept",
      front: "How do you say 'food' in Urdu?",
      back: "کھانا — khana",
      explanation: "Also the verb 'to eat'; 'khana khaya?' means 'have you eaten?'.",
    },
    {
      id: "ur-064",
      source: "urdu food",
      type: "concept",
      front: "How do you say 'I am hungry' in Urdu?",
      back: "مجھے بھوک لگی ہے — mujhe bhook lagi hai",
      explanation: "Literally 'hunger has struck me' — 'bhook' is hunger.",
    },
    {
      id: "ur-065",
      source: "urdu food",
      type: "concept",
      front: "How do you say 'I am thirsty' in Urdu?",
      back: "مجھے پیاس لگی ہے — mujhe pyaas lagi hai",
      explanation: "The same pattern as hunger: 'pyaas' is thirst, 'lagi hai' is 'has struck'.",
    },
    {
      id: "ur-066",
      source: "urdu food",
      type: "concept",
      front: "How do you say 'it's delicious' in Urdu?",
      back: "مزے دار ہے — mazedar hai",
      explanation: "'Maza' is taste or fun; 'mazedar' means tasty or enjoyable.",
    },
    {
      id: "ur-067",
      source: "urdu food",
      type: "concept",
      front: "How do you say 'vegetarian' in Urdu?",
      back: "سبزی خور — sabzi khor",
      explanation: "'Sabzi' is vegetable and 'khor' is eater — worth knowing at restaurants.",
    },
    {
      id: "ur-068",
      source: "urdu food",
      type: "concept",
      front: "How do you ask for the bill at a restaurant in Urdu?",
      back: "مہربانی کر کے بل دیجیے — meharbani kar ke bill dijiye",
      explanation: "Literally 'kindly give the bill'. 'Dijiye' is the polite 'please give'.",
    },
  ],
};

export default deck;
