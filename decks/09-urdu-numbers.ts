import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "urdu-numbers",
  title: "Urdu: numbers",
  order: 9,
  blurb: "Counting in Urdu — 1 to 100 and beyond",
  section: "urdu",
  cards: [
    {
      id: "ur-041",
      source: "urdu numbers",
      type: "concept",
      front: "How do you say 'one' in Urdu?",
      back: "ایک — aik",
      explanation: "The counting form; the same word also works as 'a' or 'an'.",
    },
    {
      id: "ur-042",
      source: "urdu numbers",
      type: "concept",
      front: "How do you say 'two' in Urdu?",
      back: "دو — do",
      explanation: "Identical in sound to English 'do', which makes it easy to remember.",
    },
    {
      id: "ur-043",
      source: "urdu numbers",
      type: "concept",
      front: "How do you say 'three' in Urdu?",
      back: "تین — teen",
      explanation: "Rhymes with English 'teen', as in thirteen.",
    },
    {
      id: "ur-044",
      source: "urdu numbers",
      type: "concept",
      front: "How do you say 'four' in Urdu?",
      back: "چار — chaar",
      explanation: "Almost the same as the Hindi numeral word and easy to pronounce.",
    },
    {
      id: "ur-045",
      source: "urdu numbers",
      type: "concept",
      front: "How do you say 'five' in Urdu?",
      back: "پانچ — paanch",
      explanation: "Note the nasal 'n' at the end — say 'paanch', not 'pach'.",
    },
    {
      id: "ur-046",
      source: "urdu numbers",
      type: "concept",
      front: "How do you say 'ten' in Urdu?",
      back: "دس — das",
      explanation: "The base for teens: eleven is 'giyarah', twelve is 'baarah', and so on.",
    },
    {
      id: "ur-047",
      source: "urdu numbers",
      type: "concept",
      front: "How do you say 'twenty' in Urdu?",
      back: "بیس — bees",
      explanation: "Combine it with units: twenty-one is 'ikees', twenty-two is 'baaees'.",
    },
    {
      id: "ur-048",
      source: "urdu numbers",
      type: "concept",
      front: "How do you say 'hundred' in Urdu?",
      back: "سو — sau",
      explanation: "Two hundred is 'do sau', three hundred is 'teen sau', and so on.",
    },
    {
      id: "ur-049",
      source: "urdu numbers",
      type: "concept",
      front: "How do you say 'thousand' in Urdu?",
      back: "ہزار — hazaar",
      explanation:
        "South Asian numbers group by lakhs and crores, but 'hazaar' still shows up everywhere.",
    },
    {
      id: "ur-050",
      source: "urdu numbers",
      type: "concept",
      front: "How do you say 'half' in Urdu?",
      back: "آدھا — aadha",
      explanation: "Handy at markets for quantities, like 'aadha kilo' for half a kilo.",
    },
  ],
};

export default deck;
