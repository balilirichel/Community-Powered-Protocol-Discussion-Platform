export interface Review {
  id: number;
  body: string;
  rating: number;
  protocol_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewRequest {
  body: string;
  rating: number;
}

export interface UpdateReviewRequest {
  body?: string;
  rating?: number;
}
