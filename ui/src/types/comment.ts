export interface Comment {
  id: number;
  body: string;
  thread_id: number;
  user_id: number;
  votes_count: number;
  user_vote: number | null; // 1 = upvote, -1 = downvote, null = no vote
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  body: string;
}

export interface UpdateCommentRequest {
  body?: string;
}

export interface VoteRequest {
  vote: 1 | -1;
}
