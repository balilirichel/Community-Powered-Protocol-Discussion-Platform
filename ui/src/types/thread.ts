export interface Thread {
  id: number;
  title: string;
  body: string;
  protocol_id: number;
  user_id: number;
  votes_count: number;
  user_vote: number | null; // 1 = upvote, -1 = downvote, null = no vote
  created_at: string;
  updated_at: string;
}

export interface CreateThreadRequest {
  title: string;
  body: string;
}

export interface UpdateThreadRequest {
  title?: string;
  body?: string;
}

export interface VoteRequest {
  vote: 1 | -1;
}
