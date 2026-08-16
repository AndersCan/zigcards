import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "urdu-directions",
  title: "Urdu: directions & travel",
  order: 17,
  blurb: "Getting around — asking and understanding directions",
  section: "urdu",
  cards: [
    {
      id: "ur-078",
      source: "urdu directions",
      type: "concept",
      front: "How do you ask 'where is...?' in Urdu?",
      back: "... کہاں ہے؟ — ... kahan hai?",
      explanation: "Put the place first: 'station kahan hai?' for 'where is the station?'.",
    },
    {
      id: "ur-079",
      source: "urdu directions",
      type: "concept",
      front: "How do you say 'the station' in Urdu?",
      back: "اسٹیشن — station",
      explanation:
        "A loanword, so it's easy; the railway station is 'railway station' in Urdu too.",
    },
    {
      id: "ur-080",
      source: "urdu directions",
      type: "concept",
      front: "How do you say 'the airport' in Urdu?",
      back: "ہوائی اڈہ — hawai adda",
      explanation: "Literally 'air port'; you'll also hear 'airport' used directly.",
    },
    {
      id: "ur-081",
      source: "urdu directions",
      type: "concept",
      front: "How do you say 'left' in Urdu?",
      back: "بائیں — baen",
      explanation: "Pair it with 'muriye' (turn) in 'baen muriye' — 'turn left'.",
    },
    {
      id: "ur-082",
      source: "urdu directions",
      type: "concept",
      front: "How do you say 'right' in Urdu?",
      back: "دائیں — daen",
      explanation: "The directional opposite of 'baen'; 'daen muriye' means turn right.",
    },
    {
      id: "ur-083",
      source: "urdu directions",
      type: "concept",
      front: "How do you say 'straight ahead' in Urdu?",
      back: "سیدھا — seedha",
      explanation: "'Seedha jaiye' means 'go straight'; 'seedha' also means honest or direct.",
    },
    {
      id: "ur-084",
      source: "urdu directions",
      type: "concept",
      front: "How do you say 'far' in Urdu?",
      back: "دور — door",
      explanation:
        "The answer to 'kya door hai?' — 'is it far?' — is usually 'door hai' or 'nazdeek hai'.",
    },
    {
      id: "ur-085",
      source: "urdu directions",
      type: "concept",
      front: "How do you say 'near' in Urdu?",
      back: "قریب — qareeb",
      explanation:
        "'Qareeb' means close by; 'paas' (as in 'aap ke paas') also works for 'near you'.",
    },
    {
      id: "ur-086",
      source: "urdu directions",
      type: "concept",
      front: "How do you say 'a taxi' in Urdu?",
      back: "ٹیکسی — taxi",
      explanation: "A loanword. To hail one: 'taxi kahan milegi?' — 'where can I get a taxi?'.",
    },
  ],
};

export default deck;
