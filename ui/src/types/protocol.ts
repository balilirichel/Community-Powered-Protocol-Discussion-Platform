export interface Protocol {
  id: number;
  title: string;
  description: string;
  slug: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProtocolRequest {
  title: string;
  description: string;
}

export interface UpdateProtocolRequest {
  title?: string;
  description?: string;
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
