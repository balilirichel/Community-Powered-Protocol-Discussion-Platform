/**
 * useThreadSearch.ts
 * ********************────────────────────
 * Thread-specific Typesense search hook.
 *
 * Wraps the generic useTypesenseSearch with thread collection defaults:
 *   • Collection name : 'threads'
 *   • queryBy fields  : 'title,body'  (matches Thread::toSearchableArray)
 *   • Default sort    : 'created_at:desc' (Newest first)
 *
 * SCHEMA NOTE (from Thread::toSearchableArray on the backend):
 *   Threads do NOT have a `rating` field or a `tags` field.
 *   - 'Top Rated' sort falls back to 'votes:desc' (same as Most Upvoted).
 *   - 'Most Reviews' uses 'comments_count:desc' (comments = thread replies).
 *   This mirrors exactly what SearchController::threads() does on the backend.
 *
 * RETURNED DOCUMENTS (ThreadDocument shape):
 *   { id, title, body, votes, comments_count, created_at }
 *
 * USAGE:
 *   const { threadHits, found, isLoading, error } = useThreadSearch({
 *     query: searchQuery,
 *     sortOption: 'Most Upvoted',
 *   });
 */

import useTypesenseSearch from './useTypesenseSearch';
import type { TypesenseSearchResult } from './useTypesenseSearch';
import {
  COLLECTIONS,
  THREAD_SORT_MAP,
  type ThreadDocument,
  type SortOption,
} from '../typesense/typesenseCollections';

// ─── Hook params ********************─────

export interface UseThreadSearchParams {
  /** Search query. Empty string performs match-all ('*'). */
  query: string;

  /**
   * UI sort option mapped via THREAD_SORT_MAP.
   *   'Newest'       → 'created_at:desc'
   *   'Top Rated'    → 'votes:desc'       (no rating field on threads)
   *   'Most Reviews' → 'comments_count:desc'
   *   'Most Upvoted' → 'votes:desc'
   */
  sortOption?: SortOption;

  /**
   * Typesense filter_by expression.
   * Example: "user_id:=123" filters to threads by specific user.
   */
  filterBy?: string;

  /** Number of results per page. Defaults to 10. */
  perPage?: number;

  /** Debounce delay in ms. Defaults to 200. */
  debounceMs?: number;
}

export interface UseThreadSearchResult
  extends TypesenseSearchResult<ThreadDocument> {
  /** Alias for hits — contextually named for thread consumers. */
  threadHits: ThreadDocument[];
}

// ─── Hook ********************────────────

function useThreadSearch({
  query,
  sortOption = 'Newest',
  filterBy,
  perPage = 10,
  debounceMs = 200,
}: UseThreadSearchParams): UseThreadSearchResult {

  /**
   * Map the UI sort label to its Typesense sort_by expression.
   * THREAD_SORT_MAP is defined in typesenseCollections.ts.
   *
   * Note the intentional difference from PROTOCOL_SORT_MAP:
   *   'Top Rated' → 'votes:desc'  (threads have no rating column)
   *   'Most Reviews' → 'comments_count:desc' (not reviews_count)
   */
  const sortBy = THREAD_SORT_MAP[sortOption];

  const result = useTypesenseSearch<ThreadDocument>({
    collection: COLLECTIONS.THREADS,   // 'threads'
    query,
    queryBy: 'title,body',          // fields indexed & searched
    sortBy,
    filterBy,
    searchOnEmpty: true,                  // return all threads on empty query
    perPage,
    debounceMs,
  });

  return {
    ...result,
    threadHits: result.hits,
  };
}

export default useThreadSearch;
