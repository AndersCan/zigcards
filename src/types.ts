export type CardType = "output" | "fix" | "concept";

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
  cards: Card[];
}
