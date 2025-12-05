export interface Round {
  id: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
  totalScore?: number;
}

export interface RoundsResponse {
  data: Round[];
  pagination: {
    limit: number;
    nextCursor?: string;
    hasMore: boolean;
  };
}

export interface TopStat {
  taps: number;
  score: number;
  user: {
    username: string;
  };
}

export interface MyStats {
  taps: number;
  score: number;
}

export interface RoundDetailResponse {
  round: Round;
  topStats: TopStat[];
  myStats: MyStats;
}
