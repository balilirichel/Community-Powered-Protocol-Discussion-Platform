/**
 * useTypesenseSearch.ts
 * ********************────────────────────
 * Generic, reusable hook that wraps the Typesense JS client's search() call.
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
 * USAGE:
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
// SearchParams is the official Typesense type for the search() method's first
// argument. Importing it directly avoids the brittle ReturnType<...> chain that
// caused "Property 'search' does not exist on type 'Document'" — TypeScript was
// confusing Typesense's Documents class with the DOM's built-in Document.
import type { SearchParams } from 'typesense/lib/Typesense/Documents';

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
  /** Array of document objects returned by Typesense. */
  hits: T[];

  /** Total number of matching documents in the collection (not just this page). */
  found: number;

  /** True while a search request is in-flight. */
  isLoading: boolean;

  /**
   * Human-readable error message if the last search failed.
   * null when there is no error.
   */
  error: string | null;

  /**
   * Call this to manually retry the last search (e.g. on an error banner).
   * Useful when Typesense was temporarily unreachable.
   */
  retry: () => void;
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
    let isCurrent = true;

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
          // SearchParams<TDocument> — TDocument is the hook's generic type arg,
          // which matches the collection type passed to .collections<TDocument>().
          // Providing it satisfies the required type parameter on SearchParams<TDoc, Infix>.
          .search(searchParams as SearchParams<TDocument>);

        if (!isCurrent) return; // A newer search already landed — discard this.

        // ── Extract the document from each hit ────────────────────────────
        // Typesense returns SearchResponseHit[], each with a `.document` field.
        const documents = (response.hits ?? []).map(
          (hit) => hit.document as TDocument,
        );

        setHits(documents);
        setFound(response.found ?? 0);
      } catch (err: unknown) {
        if (!isCurrent) return;

        // Normalize error: prefer the message from Typesense's error shape.
        const message =
          (err as { message?: string })?.message ??
          'Search failed. Please check your Typesense configuration.';

        console.error('[useTypesenseSearch] Search error:', err);
        setError(message);
        setHits([]);
        setFound(0);
      } finally {
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
