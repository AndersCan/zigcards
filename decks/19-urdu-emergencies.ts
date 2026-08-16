import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "urdu-emergencies",
  title: "Urdu: emergencies & health",
  order: 19,
  blurb: "Help, doctors, and urgent situations",
  section: "urdu",
  cards: [
    {
      id: "ur-087",
      source: "urdu emergencies",
      type: "concept",
      front: "How do you shout 'help!' in Urdu?",
      back: "مدد! — madad!",
      explanation: "Loud and clear: 'madad!' — the word for help all by itself.",
    },
    {
      id: "ur-088",
      source: "urdu emergencies",
      type: "concept",
      front: "How do you say 'I am lost' in Urdu?",
      back: "میں راستہ بھول گیا ہوں — main rasta bhool gaya hoon",
      explanation: "Literally 'I have forgotten the way'; a female speaker says 'bhool gayi hoon'.",
    },
    {
      id: "ur-089",
      source: "urdu emergencies",
      type: "concept",
      front: "How do you say 'call the police' in Urdu?",
      back: "پولیس کو بلائیں — police ko bulayen",
      explanation: "'Bulana' means to call or summon, and 'ko' marks the police as the target.",
    },
    {
      id: "ur-090",
      source: "urdu emergencies",
      type: "concept",
      front: "How do you say 'I need a doctor' in Urdu?",
      back: "مجھے ڈاکٹر کی ضرورت ہے — mujhe doctor ki zaroorat hai",
      explanation:
        "'Zaroorat' is need or requirement; the same pattern works for anything you need.",
    },
    {
      id: "ur-091",
      source: "urdu emergencies",
      type: "concept",
      front: "How do you say 'I am sick' in Urdu?",
      back: "میں بیمار ہوں — main beemar hoon",
      explanation: "'Beemar' is ill or unwell; the noun 'bemari' means illness.",
    },
    {
      id: "ur-092",
      source: "urdu emergencies",
      type: "concept",
      front: "How do you say 'hospital' in Urdu?",
      back: "ہسپتال — hospital",
      explanation: "A familiar loanword; the emergency room is 'emergency' there too.",
    },
    {
      id: "ur-093",
      source: "urdu emergencies",
      type: "concept",
      front: "How do you say 'medicine' in Urdu?",
      back: "دوا — dawa",
      explanation: "Also means medicine in general; the chemist's shop is the 'dawa khana'.",
    },
    {
      id: "ur-094",
      source: "urdu emergencies",
      type: "concept",
      front: "How do you say 'I have a headache' in Urdu?",
      back: "میرے سر میں درد ہے — mere sar mein dard hai",
      explanation: "Literally 'there is pain in my head' — swap 'sar' for any body part.",
    },
  ],
};

export default deck;
