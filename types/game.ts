export type GameState = 'LOBBY' | 'SELECTION' | 'JUDGING' | 'REVEAL' | 'RESULTS';

export interface Room {
  id: string;
  code: string;
  state: GameState;
  czar_id: string | null;
  black_card_id: number | null;
  winner_id: string | null;
  winning_selection_id: string | null;
}

export interface Player {
  id: string;
  name: string;
  room_id: string;
  score: number;
  is_host: boolean;
  is_online: boolean;
}

export interface Selection {
  id: string;
  player_id: string;
  room_id: string;
  white_card_id: number;
  revealed: boolean;
}

export interface BlackCard {
  id: number;
  text: string;
  pick: number;
}

export interface Deck {
  blackCards: BlackCard[];
  whiteCards: string[];
}
