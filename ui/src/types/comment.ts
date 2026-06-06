export interface CommentAuthor {
  id: number;
  name: string;
}

export interface Comment {
  id: number;
  body: string;

  parent_id: number | null;
  thread_id: number;

  author: CommentAuthor;

  upvotes_count?: number;
  downvotes_count?: number;

  replies?: Comment[];

  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  body: string;
  parent_id?: number | null;
}

export interface UpdateCommentRequest {
  body?: string;
}

export interface VoteRequest {
  vote: 1 | -1;
}