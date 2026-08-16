import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "urdu-feelings",
  title: "Urdu: feelings & small talk",
  order: 21,
  blurb: "Emotions and casual conversation",
  section: "urdu",
  cards: [
    {
      id: "ur-095",
      source: "urdu feelings",
      type: "concept",
      front: "How do you say 'I am happy' in Urdu?",
      back: "میں خوش ہوں — main khush hoon",
      explanation: "'Khush' is happy; you'll hear it in 'khush aamdeed' (welcome) too.",
    },
    {
      id: "ur-096",
      source: "urdu feelings",
      type: "concept",
      front: "How do you say 'I am tired' in Urdu?",
      back: "میں تھکا ہوا ہوں — main thaka hua hoon",
      explanation: "A female speaker says 'main thaki hui hoon'; 'thakna' is the verb to tire.",
    },
    {
      id: "ur-097",
      source: "urdu feelings",
      type: "concept",
      front: "How do you ask 'how do you say this in Urdu?' in Urdu?",
      back: "اردو میں یہ کیسے کہتے ہیں؟ — Urdu mein yeh kaise kehte hain?",
      explanation: "The magic phrase for language learners — point at anything and ask.",
    },
    {
      id: "ur-098",
      source: "urdu feelings",
      type: "concept",
      front: "How do you ask 'what does this word mean?' in Urdu?",
      back: "اس لفظ کا کیا مطلب ہے؟ — is lafz ka kya matlab hai?",
      explanation: "'Lafz' is word and 'matlab' is meaning — the follow-up to every new word.",
    },
    {
      id: "ur-099",
      source: "urdu feelings",
      type: "concept",
      front: "How do you ask someone to speak slowly in Urdu?",
      back: "مہربانی کر کے آہستہ بولیں — meharbani kar ke aahista bolein",
      explanation:
        "'Aahista' means slowly or quietly; you'll hear it constantly in Urdu conversation.",
    },
    {
      id: "ur-100",
      source: "urdu feelings",
      type: "concept",
      front: "How do you ask someone to repeat something in Urdu?",
      back: "مہربانی کر کے دوبارہ کہیے — meharbani kar ke dobara kahiye",
      explanation: "'Dobara' means again — 'dobara kahiye' is 'please say it again'.",
    },
  ],
};

export default deck;
