import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "urdu-time",
  title: "Urdu: time & days",
  order: 5,
  blurb: "Days of the week, times of day, and schedules",
  section: "urdu",
  cards: [
    {
      id: "ur-051",
      source: "urdu time",
      type: "concept",
      front: "How do you ask 'what time is it?' in Urdu?",
      back: "کتنا بج رہا ہے؟ — kitna baj raha hai?",
      explanation: "Literally 'how much is striking?', from 'bajna', the verb for bells striking.",
    },
    {
      id: "ur-052",
      source: "urdu time",
      type: "concept",
      front: "How do you say 'today' in Urdu?",
      back: "آج — aaj",
      explanation:
        "Pairs with 'kal' (tomorrow/yesterday) and 'parson' (day after/before tomorrow).",
    },
    {
      id: "ur-053",
      source: "urdu time",
      type: "concept",
      front: "How do you say 'tomorrow' in Urdu?",
      back: "کل — kal",
      explanation: "Beware: 'kal' also means 'yesterday' — context and verb tense tell you which.",
    },
    {
      id: "ur-054",
      source: "urdu time",
      type: "concept",
      front: "How do you say 'now' in Urdu?",
      back: "اب — ab",
      explanation: "'Abhi' (right now, in a moment) is the even more immediate cousin.",
    },
    {
      id: "ur-055",
      source: "urdu time",
      type: "concept",
      front: "How do you say 'later' in Urdu?",
      back: "بعد میں — baad mein",
      explanation: "'Baad' is 'after'; add 'mein' for 'later on'.",
    },
    {
      id: "ur-056",
      source: "urdu time",
      type: "concept",
      front: "How do you say 'in the morning' in Urdu?",
      back: "صبح — subah",
      explanation: "'Subah' is also the word for dawn itself, as in 'subah bakhair'.",
    },
    {
      id: "ur-057",
      source: "urdu time",
      type: "concept",
      front: "How do you say 'at night' in Urdu?",
      back: "رات کو — raat ko",
      explanation: "'Raat' is night and 'ko' marks the time, so it's literally 'night-at'.",
    },
    {
      id: "ur-058",
      source: "urdu time",
      type: "concept",
      front: "How do you say 'this week' in Urdu?",
      back: "اس ہفتے — is hafte",
      explanation: "'Hafta' is week; swap 'is' for 'doosre' to say 'next week'.",
    },
    {
      id: "ur-059",
      source: "urdu time",
      type: "concept",
      front: "How do you ask 'what day is it today?' in Urdu?",
      back: "آج کون سا دن ہے؟ — aaj kaun sa din hai?",
      explanation:
        "Days of the week are easy to learn in pairs: Monday is 'peer', Tuesday 'mangal'.",
    },
  ],
};

export default deck;
