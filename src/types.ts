export type CardType = "output" | "fix" | "concept";

export type SectionId = "prerequisites" | "zig" | "mojo" | "urdu";

export type Language = "zig" | "mojo";

export interface Section {
  id: SectionId;
  title: string;
  blurb: string;
  order: number;
}

export interface Card {
  id: string;
  source: string;
  type: CardType;
  front: string;
  back: string;
  code?: string;
  backCode?: string;
  explanation?: string;
}

export interface Deck {
  id: string;
  title: string;
  order: number;
  blurb: string;
  section: SectionId;
  language?: Language;
  cards: Card[];
}
