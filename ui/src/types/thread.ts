export interface ThreadProtocol {
  id: number;
  title: string;
}

export interface ThreadAuthor {
  id: number;
  name: string;
}

export interface Thread {
  id: number;
  title: string;
  body: string;
  protocol: ThreadProtocol;
  author: ThreadAuthor;
  user:ThreadAuthor;
  comments_count?: number;
  upvotes_count?: number;
  downvotes_count?: number;
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