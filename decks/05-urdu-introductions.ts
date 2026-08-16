import type { Deck } from "../src/types.ts";

const deck: Deck = {
  id: "urdu-introductions",
  title: "Urdu: introductions",
  order: 5,
  blurb: "Names, origins, and getting to know someone",
  section: "urdu",
  cards: [
    {
      id: "ur-021",
      source: "urdu introductions",
      type: "concept",
      front: "How do you ask 'what is your name?' in Urdu?",
      back: "آپ کا نام کیا ہے؟ — aap ka naam kya hai?",
      explanation: "Polite form with 'aap'. Informally you'd hear 'tumhara naam kya hai?'.",
    },
    {
      id: "ur-022",
      source: "urdu introductions",
      type: "concept",
      front: "How do you say 'my name is...' in Urdu?",
      back: "میرا نام ... ہے — mera naam ... hai",
      explanation: "Fill in your name where the dots are, e.g. 'mera naam Ali hai'.",
    },
    {
      id: "ur-023",
      source: "urdu introductions",
      type: "concept",
      front: "How do you say 'I am from Pakistan' in Urdu?",
      back: "میں پاکستان سے ہوں — main Pakistan se hoon",
      explanation: "Replace 'Pakistan' with any country or city to say where you're from.",
    },
    {
      id: "ur-024",
      source: "urdu introductions",
      type: "concept",
      front: "How do you ask 'where are you from?' in Urdu?",
      back: "آپ کہاں سے ہیں؟ — aap kahan se hain?",
      explanation: "'Kahan' is where, so this literally asks 'from where are you?'.",
    },
    {
      id: "ur-025",
      source: "urdu introductions",
      type: "concept",
      front: "How do you say 'I am learning Urdu' in Urdu?",
      back: "میں اردو سیکھ رہا ہوں — main Urdu seekh raha hoon",
      explanation:
        "'Seekh raha hoon' is the ongoing 'I am learning'. A female speaker says 'seekh rahi hoon'.",
    },
    {
      id: "ur-026",
      source: "urdu introductions",
      type: "concept",
      front: "How do you ask 'do you speak English?' in Urdu?",
      back: "کیا آپ انگریزی بولتے ہیں؟ — kya aap angrezi bolte hain?",
      explanation: "'Bolte hain' is the polite 'you speak'; for a woman it's 'bolti hain'.",
    },
    {
      id: "ur-027",
      source: "urdu introductions",
      type: "concept",
      front: "How do you say 'I don't speak Urdu well' in Urdu?",
      back: "میں اردو اچھی طرح نہیں بولتا — main Urdu achhi tarah nahin bolta",
      explanation: "'Achhi tarah' means well; a female speaker ends with 'bolti'.",
    },
    {
      id: "ur-028",
      source: "urdu introductions",
      type: "concept",
      front: "How do you say 'I understand a little' in Urdu?",
      back: "مجھے تھوڑی سمجھ آتی ہے — mujhe thori samajh aati hai",
      explanation: "Reassures the other person to keep talking slowly; 'samajh' is understanding.",
    },
    {
      id: "ur-029",
      source: "urdu introductions",
      type: "concept",
      front: "How do you ask 'how old are you?' in Urdu?",
      back: "آپ کی عمر کتنی ہے؟ — aap ki umar kitni hai?",
      explanation: "'Umar' is age and 'kitni' is how much, so literally 'how much is your age?'.",
    },
    {
      id: "ur-030",
      source: "urdu introductions",
      type: "concept",
      front: "How do you say 'I am twenty years old' in Urdu?",
      back: "میری عمر بیس سال ہے — meri umar bees saal hai",
      explanation: "The pattern is 'meri umar <number> saal hai' — swap the number for your age.",
    },
  ],
};

export default deck;
