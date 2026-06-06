export interface SearchParams {
  q: string;
  filter?: string;
  per_page?: number;
}

export interface ReindexRequest {
  model?: 'protocol' | 'thread';
}

export interface SearchHit<T> {
  document: T;
  highlight: Record<string, { matched_tokens: string[]; snippet: string }>;
  text_match: number;
}

export interface SearchResponse<T> {
  data: T[];
  meta: {
    found: number;
    out_of: number;
    page: number;
    search_time_ms: number;
  };
}
