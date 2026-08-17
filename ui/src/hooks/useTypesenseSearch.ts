/**
 * useTypesenseSearch.ts
 * ********************────────────────────
 * Generic, reusable hook that wraps the Typesense JS client's search() call,
 * with an automatic two-tier fallback to the Laravel SearchController when
 * Typesense is unavailable or returns an empty result set.
 *
 * DESIGN GOALS:
 *  • Collection-agnostic — callers pass the collection name and search params.
 *  • Debounced — avoids a Typesense request on every keypress.
 *  • Cancellable — aborts in-flight search when params change, preventing
 *    stale result races.
 *  • Error-safe — catches and surfaces errors without crashing the component.
 *  • Zero side-effects on mount — does not fire if `query` is empty and
 *    `searchOnEmpty` is false (see params below).
 *
 * FALLBACK STRATEGY (TWO EXPLICIT TRIGGERS):
 *
 *   Trigger A — Typesense throws / times out / is unreachable:
 *     The catch block detects the error, logs it as a Typesense failure,
 *     then immediately calls the Laravel backend (/v1/search/<collection>).
 *     isLoading stays true throughout so the UI never flashes a blank state.
 *     If the backend also fails, `error` is set with the backend message.
 *
 *   Trigger B — Typesense responds with found === 0 (empty result set):
 *     After a successful Typesense response, the hook checks whether
 *     `response.found === 0`. If so, it calls the Laravel backend before
 *     committing the empty array to state. isLoading stays true during
 *     the backend call.
 *
 * FALLBACK LIMITATIONS (flagged for review):
 *   • `filterBy` is a Typesense filter expression (e.g. 'tags:=[nutrition]').
 *     The Laravel backend does NOT accept this syntax — it only understands
 *     `filter=recent|reviewed|rated|upvoted`. The fallback drops `filterBy`
 *     for backend calls. This means user_id / tag filters are not preserved
 *     during fallback (ProfilePage, tag category pills). This is explicitly
 *     logged as a warning so you can decide whether to add a backend user_id
 *     param later.
 *   • The backend returns full REST objects (Protocol/Thread), not flat
 *     Typesense documents. The adapter (backendItemsToHits) maps the subset
 *     of fields that exist on both shapes; fields absent in the backend
 *     (e.g. Protocol.content, Thread.body full text) are preserved as-is.
 *
 * USAGE (unchanged from before — public API is identical):
 *   const { hits, found, isLoading, error } = useTypesenseSearch<MyDoc>({
 *     collection: 'protocols',
 *     query: 'low carb',
 *     queryBy: 'title,tags',
 *     sortBy: 'created_at:desc',
 *     filterBy: 'tags:=[nutrition]',
 *     perPage: 15,
 *   });
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import typesenseClient from '../typesense/typesenseClient';
import { searchService } from '../api/searchService';
import type { SearchParams } from '../types/search';
// SearchParams is the official Typesense type for the search() method's first
// argument. Importing it directly avoids the brittle ReturnType<...> chain that
// caused "Property 'search' does not exist on type 'Document'" — TypeScript was
// confusing Typesense's Documents class with the DOM's built-in Document.
import type { SearchParams as TypesenseSearchParams_ts } from 'typesense/lib/Typesense/Documents';

// ─── Types ********************───────────

export interface TypesenseSearchParams {
  /** Typesense collection to search (e.g. 'protocols', 'threads'). */
  collection: string;

  /**
   * Search query string.
   * Pass '*' for match-all (useful for listing everything on empty input).
   */
  query: string;

  /**
   * Comma-separated list of fields to run full-text search across.
   * Must match the fields indexed in Typesense (see typesenseCollections.ts).
   * Example: 'title,tags'
   */
  queryBy: string;

  /**
   * Typesense sort_by string.
   * Format: '<field>:<asc|desc>[,<field>:<asc|desc>]'
   * Example: 'created_at:desc' | 'rating:desc,created_at:desc'
   */
  sortBy?: string;

  /**
   * Typesense filter_by expression.
   * Supports equality, range, and array containment.
   * Example: 'tags:=[nutrition]' | 'rating:>4'
   * Leave undefined for no filtering.
   *
   * NOTE: This field is only applied to Typesense. The Laravel backend fallback
   * does not accept Typesense filter syntax — see FALLBACK LIMITATIONS above.
   */
  filterBy?: string;

  /** Number of results to return per page. Defaults to 15. */
  perPage?: number;

  /** Page number (1-indexed). Defaults to 1. */
  page?: number;

  /**
   * When true, fires the search even when query === ''.
   * The hook will convert an empty query to '*' (match-all) automatically.
   * Defaults to true.
   */
  searchOnEmpty?: boolean;

  /**
   * Debounce delay in milliseconds.
   * Prevents a Typesense request on every single keypress.
   * Defaults to 200 ms — fast enough for search-as-you-type.
   */
  debounceMs?: number;
}

export interface TypesenseSearchResult<T> {
  /** Array of document objects returned by Typesense (or backend fallback). */
  hits: T[];

  /** Total number of matching documents in the collection (not just this page). */
  found: number;

  /** True while a search request is in-flight (including fallback calls). */
  isLoading: boolean;

  /**
   * Human-readable error message if the last search failed.
   * null when there is no error.
   * NOTE: Only set when BOTH Typesense AND the backend fallback fail.
   *       If only Typesense fails but the backend succeeds, error remains null.
   */
  error: string | null;

  /**
   * Call this to manually retry the last search (e.g. on an error banner).
   * Useful when Typesense was temporarily unreachable.
   */
  retry: () => void;
}

// ─── Sort option → backend filter param mapping ───────────────────────────────
/**
 * Maps the Typesense sort_by string back to the backend's `filter` param.
 * SearchController accepts: 'recent' | 'reviewed' | 'rated' | 'upvoted'
 *
 * This is the inverse of PROTOCOL_SORT_MAP / THREAD_SORT_MAP. We need it here
 * because useTypesenseSearch only receives the already-resolved sort_by string,
 * not the original SortOption label.
 */
const SORT_BY_TO_BACKEND_FILTER: Record<string, SearchParams['filter']> = {
  'created_at:desc': 'recent',
  'rating:desc': 'rated',
  'reviews_count:desc': 'reviewed',
  'comments_count:desc': 'reviewed',  // threads: 'Most Reviews' → comments_count
  'votes:desc': 'upvoted',
};

/**
 * Resolves the backend `filter` value from a Typesense sort_by string.
 * Falls back to 'recent' if the sort_by string is unrecognized.
 */
function sortByToBackendFilter(sortBy?: string): SearchParams['filter'] {
  if (!sortBy) return 'recent';
  return SORT_BY_TO_BACKEND_FILTER[sortBy] ?? 'recent';
}

// ─── Backend fallback adapter ─────────────────────────────────────────────────
/**
 * Adapts backend REST items (Protocol | Thread full objects) to the flat
 * Typesense document shape that consumers of this hook expect.
 *
 * The backend returns richer objects (nested author, string dates, etc.).
 * We map the overlapping fields and coerce types to match ProtocolDocument /
 * ThreadDocument shapes without breaking callers.
 *
 * Fields that exist in REST but not Typesense (e.g. author, content) are
 * intentionally dropped here — consumers that need them use the REST
 * enrichment map (see HomePage.tsx Phase 2).
 *
 * Assumption: The item's `id` may be a number in REST — we coerce to string
 * to match Typesense's convention.
 */
function backendItemsToHits<TDocument extends Record<string, unknown>>(
  items: Record<string, unknown>[],
): TDocument[] {
  return items.map((item) => {
    const id = String(item.id ?? '');

    // Protocol fields present on backend REST shape
    const tags = Array.isArray(item.tags) ? (item.tags as string[]) : [];
    const rating =
      typeof item.rating === 'number' ? item.rating : Number(item.rating ?? 0);
    const reviews_count = Number(item.reviews_count ?? 0);

    // Thread fields: comments_count (from REST) or derived from upvotes/downvotes
    const comments_count = Number(item.comments_count ?? 0);

    // votes: backend Eloquent uses withSum('votes','value') → alias 'votes_sum_value'.
    // Fall back to item.votes for any other REST shape that exposes it directly.
    const votes = Number(item.votes_sum_value ?? item.votes ?? 0);

    // created_at: backend returns ISO string, Typesense stores unix seconds.
    // Coerce to unix seconds so consumers reading created_at as a timestamp work.
    let created_at = 0;
    if (typeof item.created_at === 'string') {
      const ms = Date.parse(item.created_at);
      created_at = isNaN(ms) ? 0 : Math.floor(ms / 1000);
    } else if (typeof item.created_at === 'number') {
      created_at = item.created_at;
    }

    // user_id: REST may nest this as author.id
    const user_id =
      typeof item.user_id !== 'undefined'
        ? String(item.user_id)
        : item.author && typeof (item.author as Record<string, unknown>).id !== 'undefined'
          ? String((item.author as Record<string, unknown>).id)
          : undefined;

    // protocol_id: present on Thread REST objects
    const protocol_id =
      item.protocol && typeof (item.protocol as Record<string, unknown>).id !== 'undefined'
        ? String((item.protocol as Record<string, unknown>).id)
        : typeof item.protocol_id !== 'undefined'
          ? String(item.protocol_id)
          : undefined;

    const title = String(item.title ?? '');

    // Thread-specific
    const body = typeof item.body === 'string' ? item.body : '';

    return {
      id,
      title,
      tags,
      votes,
      rating,
      reviews_count,
      comments_count,
      created_at,
      user_id,
      // only set when present (threads)
      ...(body ? { body } : {}),
      ...(protocol_id ? { protocol_id } : {}),
    } as unknown as TDocument;
  });
}

// ─── Hook implementation ──────────────────────────────────────────────────────

function useTypesenseSearch<TDocument extends Record<string, any>>(
  params: TypesenseSearchParams,
): TypesenseSearchResult<TDocument> {
  const {
    collection,
    query,
    queryBy,
    sortBy,
    filterBy,
    perPage = 15,
    page = 1,
    searchOnEmpty = true,
    debounceMs = 200,
  } = params;

  const [hits, setHits] = useState<TDocument[]>([]);
  const [found, setFound] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks the latest debounce timer so we can clear it on re-render.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Allows the search to be re-triggered manually without changing params.
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => setRetryCount((n) => n + 1), []);

  useEffect(() => {
    // Skip search entirely when empty queries are not wanted.
    if (!searchOnEmpty && query.trim() === '') {
      setHits([]);
      setFound(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Convert empty string to '*' — Typesense match-all wildcard.
    const effectiveQuery = query.trim() === '' ? '*' : query.trim();

    // Flag to prevent setting state after the component has unmounted or
    // after a newer search has started (avoids stale result races).
    // This flag is shared between the Typesense and backend fallback phases
    // so that if the effect is cancelled mid-fallback, neither phase can
    // commit stale results.
    let isCurrent = true;

    // ── Backend fallback ────────────────────────────────────────────────────
    /**
     * Calls the Laravel SearchController as a fallback.
     * Called explicitly in two cases (kept separate for clarity):
     *   A. Typesense threw / timed out.
     *   B. Typesense returned found === 0.
     *
     * isLoading is already true when this is called — no flash of empty state.
     *
     * NOTE: `filterBy` (Typesense syntax) is not forwarded to the backend.
     *       If filterBy was set (e.g. user_id:=123 in ProfilePage, tag filter
     *       in HomePage), the fallback returns unfiltered results.
     *       This is logged as a warning so you can address it later.
     */
    const callBackendFallback = async (trigger: 'error' | 'empty') => {
      if (filterBy) {
        console.warn(
          `[useTypesenseSearch] Fallback triggered (${trigger}): filterBy="${filterBy}" ` +
          'cannot be forwarded to the Laravel backend (incompatible syntax). ' +
          'Fallback results will be unfiltered.'
        );
      }

      // Map the Typesense sort_by string → backend filter param.
      const backendFilter = sortByToBackendFilter(sortBy);

      // Build backend SearchParams (matches searchService / SearchController contract).
      const backendParams: SearchParams = {
        // Pass '*' as-is; backend treats it as match-all.
        q: effectiveQuery === '*' ? '*' : effectiveQuery,
        filter: backendFilter,
        per_page: perPage,
      };

      try {
        // Route to the correct backend endpoint by collection name.
        // 'protocols' → searchService.protocols(), 'threads' → searchService.threads()
        const response =
          collection === 'threads'
            ? await searchService.threads(backendParams)
            : await searchService.protocols(backendParams);

        if (!isCurrent) return;

        // Adapt the full REST objects to the flat Typesense document shape.
        const adapted = backendItemsToHits<TDocument>(
          (response.data as unknown as Record<string, unknown>[]),
        );

        setHits(adapted);
        // Backend returns meta.total for the full count.
        setFound(response.meta.total);
        // Clear any error — the fallback succeeded.
        setError(null);

        console.info(
          `[useTypesenseSearch] Backend fallback succeeded (trigger=${trigger}). ` +
          `collection=${collection}, total=${response.meta.total}`
        );
      } catch (backendErr: unknown) {
        if (!isCurrent) return;

        // Both Typesense and the backend failed. Surface the backend error.
        const message =
          (backendErr as { message?: string })?.message ??
          'Search is temporarily unavailable. Please try again.';

        console.error(
          `[useTypesenseSearch] Backend fallback also failed (trigger=${trigger}):`,
          backendErr,
        );

        setError(message);
        setHits([]);
        setFound(0);
      }
    };

    const doSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // ── Build the Typesense search parameters ──────────────────────────
        const searchParams: Record<string, unknown> = {
          q: effectiveQuery,   // The search query (or '*' for all)
          query_by: queryBy,          // Which fields to search in
          per_page: perPage,          // Pagination page size
          page,                       // Current page (1-indexed)
        };

        // sort_by is optional — if omitted Typesense uses its default ranking.
        if (sortBy) {
          searchParams.sort_by = sortBy;
        }

        // filter_by is optional — if omitted no filtering is applied.
        if (filterBy) {
          searchParams.filter_by = filterBy;
        }

        // ── Fire the search against the configured Typesense collection ────
        // Cast searchParams to SearchParams (the Typesense library's own type)
        // instead of the fragile Parameters<ReturnType<...>> chain that was
        // causing TypeScript to resolve to the DOM Document interface.
        const response = await typesenseClient
          .collections<TDocument>(collection)
          .documents()
          // TypesenseSearchParams_ts<TDocument> — TDocument is the hook's generic type arg,
          // which matches the collection type passed to .collections<TDocument>().
          // Providing it satisfies the required type parameter on SearchParams<TDoc, Infix>.
          .search(searchParams as TypesenseSearchParams_ts<TDocument>);

        if (!isCurrent) return; // A newer search already landed — discard this.

        // ── Extract the document from each hit ────────────────────────────
        // Typesense returns SearchResponseHit[], each with a `.document` field.
        const documents = (response.hits ?? []).map(
          (hit) => hit.document as TDocument,
        );

        // ── TRIGGER B: Typesense returned successfully but found === 0 ─────
        // Do NOT commit the empty array yet — call the backend first.
        // isLoading stays true so the UI never shows a "no results" flash.
        if (response.found === 0) {
          console.info(
            '[useTypesenseSearch] Typesense returned empty result set (found=0). ' +
            `collection=${collection}, query="${effectiveQuery}". ` +
            'Trying Laravel backend fallback…'
          );
          await callBackendFallback('empty');
          return; // callBackendFallback has already set state.
        }

        setHits(documents);
        setFound(response.found ?? 0);
      } catch (err: unknown) {
        if (!isCurrent) return;

        // ── TRIGGER A: Typesense threw / timed out / is unreachable ───────
        // Log the Typesense failure separately from any subsequent backend error.
        console.error(
          '[useTypesenseSearch] Typesense search error — triggering backend fallback:',
          err,
        );

        // isLoading is still true — call backend without clearing state first
        // so the UI never flashes an empty/error state mid-flight.
        await callBackendFallback('error');
        return; // callBackendFallback has already set state.
      } finally {
        // Only clear isLoading when isCurrent — prevents state updates after
        // the effect has been cleaned up (unmount or newer search started).
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    // ── Debounce: clear any pending timer before scheduling the new one ────
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(doSearch, debounceMs);

    // Cleanup: cancel the pending timer and mark this effect as stale.
    return () => {
      isCurrent = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    collection,
    query,
    queryBy,
    sortBy,
    filterBy,
    perPage,
    page,
    searchOnEmpty,
    debounceMs,
    retryCount,
  ]);

  return { hits, found, isLoading, error, retry };
}

export default useTypesenseSearch;
