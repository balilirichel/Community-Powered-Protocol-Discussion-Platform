export interface ReviewAuthor {
  id: number;
  name: string;
}

export interface ReviewProtocol {
  id: number;
  title: string;
}

export interface Review {
  id: number;
  rating: number;
  feedback: string;

  author: ReviewAuthor;
  protocol: ReviewProtocol;

  created_at: string;
  updated_at: string;
}

export interface CreateReviewRequest {
  rating: number;
  feedback: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  feedback?: string;
}