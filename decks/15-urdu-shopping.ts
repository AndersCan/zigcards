import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "urdu-shopping",
  title: "Urdu: shopping",
  order: 15,
  blurb: "Prices, bargaining, and buying things",
  section: "urdu",
  cards: [
    {
      id: "ur-069",
      source: "urdu shopping",
      type: "concept",
      front: "How do you ask 'how much is this?' in Urdu?",
      back: "اس کی کتنی قیمت ہے؟ — is ki kitni qeemat hai?",
      explanation: "'Qeemat' is price; this is the standard market opener.",
    },
    {
      id: "ur-070",
      source: "urdu shopping",
      type: "concept",
      front: "How do you say 'that's too expensive' in Urdu?",
      back: "بہت مہنگا ہے — bohat mehnga hai",
      explanation: "The first half of every negotiation — 'mehnga' means expensive.",
    },
    {
      id: "ur-071",
      source: "urdu shopping",
      type: "concept",
      front: "How do you ask for a lower price in Urdu?",
      back: "تھوڑا سستا کر دیجیے — thora sasta kar dijiye",
      explanation: "Literally 'make it a little cheaper' — 'sasta' is cheap or reduced.",
    },
    {
      id: "ur-072",
      source: "urdu shopping",
      type: "concept",
      front: "How do you ask 'do you have...?' in Urdu?",
      back: "کیا آپ کے پاس ... ہے؟ — kya aap ke paas ... hai?",
      explanation: "Fill in the item, e.g. 'kya aap ke paas chai hai?' for 'do you have tea?'.",
    },
    {
      id: "ur-073",
      source: "urdu shopping",
      type: "concept",
      front: "How do you say 'I want to buy this' in Urdu?",
      back: "میں یہ خریدنا چاہتا ہوں — main yeh khareedna chahta hoon",
      explanation: "'Khareedna' is to buy; a female speaker says 'chahti hoon'.",
    },
    {
      id: "ur-074",
      source: "urdu shopping",
      type: "concept",
      front: "How do you say 'money' in Urdu?",
      back: "پیسے — paise",
      explanation: "Informal and everyday. 'Rupay' is used for rupees specifically.",
    },
    {
      id: "ur-075",
      source: "urdu shopping",
      type: "concept",
      front: "How do you ask for a discount in Urdu?",
      back: "کچھ رعایت کیجیے — kuch riayat kijiye",
      explanation: "'Riayat' is a reduction or discount; 'kuch' means a bit or some.",
    },
    {
      id: "ur-076",
      source: "urdu shopping",
      type: "concept",
      front: "How do you ask 'can I pay by card?' in Urdu?",
      back: "کیا میں کارڈ سے ادائیگی کر سکتا ہوں؟ — kya main card se adaigi kar sakta hoon?",
      explanation:
        "'Adaigi' is payment; the answer is often 'paise mein' (cash only) at small shops.",
    },
    {
      id: "ur-077",
      source: "urdu shopping",
      type: "concept",
      front: "How do you say 'market' in Urdu?",
      back: "بازار — bazaar",
      explanation: "Familiar from English — a bazaar is a market street or shopping district.",
    },
  ],
};

export default deck;
