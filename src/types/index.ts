export interface User {
  username: string;
  token: string;
  isAdmin: boolean;
}

export interface Round {
  id: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
  totalScore?: number;
}

export interface RoundDetail extends Round {
  totalTaps?: number;
  winner?: string;
  playerScore?: number;
}

export interface TapResponse {
  score: number;
  totalTaps: number;
}

export interface RoundStats {
  totalTaps: number;
  winner: string;
  personalScore: number;
}

export interface RoundsResponse {
  data: Round[];
  pagination: {
    limit: number;
    nextCursor?: string;
    hasMore: boolean;
  };
}
