import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "urdu-politeness",
  title: "Urdu: politeness & apologies",
  order: 1,
  blurb: "Please, thank you, sorry — the everyday manners",
  section: "urdu",
  cards: [
    {
      id: "ur-011",
      source: "urdu politeness",
      type: "concept",
      front: "How do you say 'thank you' in Urdu?",
      back: "شکریہ — shukriya",
      explanation:
        "The everyday thank-you. Say 'bohat shukriya' for a stronger 'thank you very much'.",
    },
    {
      id: "ur-012",
      source: "urdu politeness",
      type: "concept",
      front: "How do you say 'thank you very much' in Urdu?",
      back: "بہت شکریہ — bohat shukriya",
      explanation: "'Bohat' means very or a lot, so this is a warmer, more emphatic thanks.",
    },
    {
      id: "ur-013",
      source: "urdu politeness",
      type: "concept",
      front: "How do you say 'please' in Urdu?",
      back: "برائے مہربانی — baraye meharbani",
      explanation: "Literally 'for kindness'. Often shortened to just 'meharbani'.",
    },
    {
      id: "ur-014",
      source: "urdu politeness",
      type: "concept",
      front: "How do you say 'sorry' in Urdu?",
      back: "معاف کیجیے — maaf kijiye",
      explanation: "A polite apology, formed from 'maaf' (forgiven) and the polite verb form.",
    },
    {
      id: "ur-015",
      source: "urdu politeness",
      type: "concept",
      front: "How do you say 'excuse me' in Urdu?",
      back: "معذرت — maazrat",
      explanation: "Use it to get attention or interrupt politely, e.g. before asking directions.",
    },
    {
      id: "ur-016",
      source: "urdu politeness",
      type: "concept",
      front: "How do you say 'you're welcome' in Urdu?",
      back: "کوئی بات نہیں — koi baat nahin",
      explanation: "Literally 'it's nothing'. The natural reply to 'shukriya'.",
    },
    {
      id: "ur-017",
      source: "urdu politeness",
      type: "concept",
      front: "How do you say 'no problem' in Urdu?",
      back: "کوئی مسئلہ نہیں — koi masla nahin",
      explanation: "Reassures that something isn't a problem; 'masla' is problem.",
    },
    {
      id: "ur-018",
      source: "urdu politeness",
      type: "concept",
      front: "How do you say 'it's my fault' in Urdu?",
      back: "میری غلطی ہے — meri ghalti hai",
      explanation: "'Ghalti' is mistake or fault. Handy for owning up to an error.",
    },
    {
      id: "ur-019",
      source: "urdu politeness",
      type: "concept",
      front: "How do you say 'I didn't mean that' in Urdu?",
      back: "میرا یہ مطلب نہیں تھا — mera yeh matlab nahin tha",
      explanation: "Softens a misunderstood remark; 'matlab' means meaning or intention.",
    },
    {
      id: "ur-020",
      source: "urdu politeness",
      type: "concept",
      front: "How do you say 'please forgive me' in Urdu?",
      back: "مجھے معاف کر دیجیے — mujhe maaf kar dijiye",
      explanation: "A stronger, more heartfelt apology than the plain 'maaf kijiye'.",
    },
  ],
};

export default deck;
