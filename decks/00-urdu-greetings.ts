import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "urdu-greetings",
  title: "Urdu: greetings",
  order: 0,
  blurb: "Hello, goodbye, and meeting someone",
  section: "urdu",
  cards: [
    {
      id: "ur-001",
      source: "urdu greetings",
      type: "concept",
      front: "How do you say 'hello' in Urdu?",
      back: "سلام — salaam",
      explanation:
        "The short everyday greeting, from the fuller assalamu alaikum. Respond with the same word.",
    },
    {
      id: "ur-002",
      source: "urdu greetings",
      type: "concept",
      front: "How do you say 'goodbye' in Urdu?",
      back: "خدا حافظ — khuda hafiz",
      explanation: "Literally 'God be your protector'. The standard leave-taking in Pakistan.",
    },
    {
      id: "ur-003",
      source: "urdu greetings",
      type: "concept",
      front: "How do you say 'good morning' in Urdu?",
      back: "صبح بخیر — subah bakhair",
      explanation:
        "Used until late morning. For the evening there's a matching phrase with 'shaam'.",
    },
    {
      id: "ur-004",
      source: "urdu greetings",
      type: "concept",
      front: "How do you say 'good evening' in Urdu?",
      back: "شام بخیر — shaam bakhair",
      explanation: "The evening counterpart of 'subah bakhair', said after sunset.",
    },
    {
      id: "ur-005",
      source: "urdu greetings",
      type: "concept",
      front: "How do you ask 'how are you?' politely in Urdu?",
      back: "آپ کیسے ہیں؟ — aap kaise hain?",
      explanation: "'Aap' is the polite 'you'; use this with strangers and elders.",
    },
    {
      id: "ur-006",
      source: "urdu greetings",
      type: "concept",
      front: "How do you ask 'how are you?' casually in Urdu?",
      back: "تم کیسے ہو؟ — tum kaise ho?",
      explanation: "'Tum' is the informal 'you', for friends and people your own age.",
    },
    {
      id: "ur-007",
      source: "urdu greetings",
      type: "concept",
      front: "How do you say 'I'm fine, thank you' in Urdu?",
      back: "میں ٹھیک ہوں، شکریہ — main theek hoon, shukriya",
      explanation: "The standard reply to 'aap kaise hain?'. 'Theek' means fine or okay.",
    },
    {
      id: "ur-008",
      source: "urdu greetings",
      type: "concept",
      front: "How do you say 'see you later' in Urdu?",
      back: "پھر ملیں گے — phir milenge",
      explanation: "Literally 'we will meet again'. A warm, common way to part.",
    },
    {
      id: "ur-009",
      source: "urdu greetings",
      type: "concept",
      front: "How do you say 'nice to meet you' in Urdu?",
      back: "آپ سے مل کر خوشی ہوئی — aap se mil kar khushi hui",
      explanation: "Said when meeting someone for the first time; 'khushi' is happiness.",
    },
    {
      id: "ur-010",
      source: "urdu greetings",
      type: "concept",
      front: "How do you say 'welcome' in Urdu?",
      back: "خوش آمدید — khush aamdeed",
      explanation: "Literally 'happy arrival'. Used to welcome guests.",
    },
  ],
};

export default deck;
