/**
 * useProtocolSearch.ts
 * ********************────────────────────
 * Protocol-specific Typesense search hook.
 *
 * Wraps the generic useTypesenseSearch with protocol collection defaults:
 *   • Collection name : 'protocols'
 *   • queryBy fields  : 'title,tags'  (matches Protocol::toSearchableArray)
 *   • Default sort    : 'created_at:desc' (Newest first)
 *
 * RETURNED DOCUMENTS (ProtocolDocument shape):
 *   { id, title, tags, votes, rating, reviews_count, created_at }
 *
 * These are *flat* Typesense documents. The parent component merges them with
 * the full Protocol objects from the REST API (which include author, content, etc.)
 * using the `id` field as the join key.
 *
 * USAGE:
 *   const { protocolHits, found, isLoading, error, retry } = useProtocolSearch({
 *     query: searchQuery,
 *     sortBy: PROTOCOL_SORT_MAP['Top Rated'],
 *     filterBy: 'tags:=[nutrition]',
 *   });
 */

import useTypesenseSearch from './useTypesenseSearch';
import type { TypesenseSearchResult } from './useTypesenseSearch';
import {
  COLLECTIONS,
  PROTOCOL_SORT_MAP,
  type ProtocolDocument,
  type SortOption,
} from '../typesense/typesenseCollections';

// ─── Hook params ********************─────

export interface UseProtocolSearchParams {
  /** Search query string. Empty string performs match-all ('*'). */
  query: string;

  /**
   * UI sort option.
   * Mapped to a Typesense sort_by string via PROTOCOL_SORT_MAP.
   * Defaults to 'Newest'.
   */
  sortOption?: SortOption;

  /**
   * Typesense filter_by expression for tag filtering.
   * Example: "tags:=[nutrition]" filters to protocols tagged 'nutrition'.
   * Leave undefined for no tag filter.
   */
  tagFilter?: string;

  /**
   * Additional Typesense filter_by expression.
   * Can be combined with tagFilter via AND.
   * Example: "user_id:=123" filters to protocols by specific user.
   */
  filterBy?: string;

  /** Number of results per page. Defaults to 20 for the discovery grid. */
  perPage?: number;

  /** Debounce delay in ms for search-as-you-type. Defaults to 200. */
  debounceMs?: number;
}

export interface UseProtocolSearchResult
  extends TypesenseSearchResult<ProtocolDocument> {
  /** Alias for hits — contextually named for protocol consumers. */
  protocolHits: ProtocolDocument[];
}

// ─── Hook ********************────────────

function useProtocolSearch({
  query,
  sortOption = 'Newest',
  tagFilter,
  filterBy,
  perPage = 20,
  debounceMs = 200,
}: UseProtocolSearchParams): UseProtocolSearchResult {

  /**
   * Map the UI sort label to its Typesense sort_by string.
   * PROTOCOL_SORT_MAP is defined in typesenseCollections.ts so the mapping
   * lives in one place and is shared with any future components.
   *
   *   'Newest'       → 'created_at:desc'
   *   'Top Rated'    → 'rating:desc'
   *   'Most Reviews' → 'reviews_count:desc'
   *   'Most Upvoted' → 'votes:desc'
   */
  const sortBy = PROTOCOL_SORT_MAP[sortOption];

  /**
   * Build filter_by expression.
   * Compose tag filter and custom filter with && if both are provided.
   * Example: 'tags:=[nutrition] && user_id:=123'
   */
  const composedFilter = [tagFilter, filterBy].filter(Boolean).join(' && ') || undefined;

  // Delegate to the generic hook with protocol-specific defaults.
  const result = useTypesenseSearch<ProtocolDocument>({
    collection: COLLECTIONS.PROTOCOLS, // 'protocols'
    query,
    queryBy: 'title,tags',          // fields indexed & searched
    sortBy,
    filterBy: composedFilter,
    perPage,
    searchOnEmpty: true,                  // show all protocols when bar is empty
    debounceMs,
  });

  return {
    ...result,
    protocolHits: result.hits,
  };
}

export default useProtocolSearch;
