export interface User {
  username: string;
  token: string;
  isAdmin: boolean;
}

export interface Round {
  id: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'completed';
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
