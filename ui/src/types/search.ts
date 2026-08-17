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

/**
 * Shape returned by SearchController::protocols() and SearchController::threads().
 * NOTE: This intentionally differs from the Typesense client response shape.
 *   - data  → T[] (full Protocol / Thread REST objects from $results->items())
 *   - meta  → Laravel paginator fields
 */
export interface SearchResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  filter: string;
  query: string;
  note?: string;
}
