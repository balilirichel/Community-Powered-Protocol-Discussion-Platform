export interface Protocol {
  id: number;
  title: string;
  content: string;
  tags: string[];
  rating: number | null;

  author: {
    id: number;
    name: string;
  };

  threads_count?: number;
  reviews_count?: number;

  created_at: string;
  updated_at: string;
}

export interface CreateProtocolRequest {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateProtocolRequest {
  title?: string;
  content?: string;
  tags?: string[];
}
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}
