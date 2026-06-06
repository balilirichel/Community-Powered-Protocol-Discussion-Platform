/**
 * typesenseCollections.ts
 * ********************────────────────────
 * TypeScript types that mirror the Typesense collection schemas defined on
 * the Laravel backend (Protocol::toSearchableArray / Thread::toSearchableArray).
 *
 * These are *document* shapes — what Typesense stores and returns in hits.
 * They are intentionally flat (no nested relations) because Typesense indexes
 * flat JSON documents; the API layer enriches them with relations separately.
 *
 * Collection names match what the backend registers via searchableAs():
 *   Protocol::searchableAs() → 'protocols'
 *   Thread::searchableAs()   → 'threads'
 */

// ─── Protocol document (mirrors Protocol::toSearchableArray) ──────────────────
export interface ProtocolDocument {
  /** Primary key as string — Typesense stores all IDs as strings. */
  id: string;

  /** Full protocol title — used for full-text search and display. */
  title: string;

  /**
   * User ID that created this protocol.
   * Used for filtering protocols by author on profile page.
   */
  user_id?: string;

  /**
   * Tag array (e.g. ['nutrition', 'sleep']).
   * Used both for full-text matching and as a filterable field.
   */
  tags: string[];

  /**
   * Net vote score: SUM(votes.value) where value is +1 (upvote) or -1 (downvote).
   * Used for 'Most Upvoted' sort → sort_by: 'votes:desc'
   */
  votes: number;

  /**
   * Average star rating (1-5) stored as float.
   * Used for 'Top Rated' sort → sort_by: 'rating:desc'
   */
  rating: number;

  /**
   * Total number of reviews left on this protocol.
   * Used for 'Most Reviews' sort → sort_by: 'reviews_count:desc'
   */
  reviews_count: number;

  /**
   * Unix timestamp (seconds) of creation.
   * Used for 'Most Recent' sort → sort_by: 'created_at:desc'
   */
  created_at: number;
}

// ─── Thread document (mirrors Thread::toSearchableArray) ──────────────────────
export interface ThreadDocument {
  /** Primary key as string. */
  id: string;

  /** Thread title — primary full-text search field. */
  title: string;

  /** Thread body — secondary full-text search field. */
  body: string;

  /**
   * User ID that created this thread.
   * Used for filtering threads by author on profile page.
   */
  user_id?: string;

  /**
   * Protocol ID that owns this thread.
   * Included so thread search results can navigate into the thread detail page.
   */
  protocol_id?: string;

  /**
   * Net vote score.
   * Used for 'Most Upvoted' sort → sort_by: 'votes:desc'
   */
  votes: number;

  /**
   * Number of comments (replies) on this thread.
   * Threads use comments as a proxy for 'reviews' — the backend sorts
   * thread 'reviewed' filter by comments_count, not reviews_count.
   * Used for 'Most Reviews' sort → sort_by: 'comments_count:desc'
   */
  comments_count: number;

  /**
   * Unix timestamp (seconds) of creation.
   * Used for 'Most Recent' sort → sort_by: 'created_at:desc'
   */
  created_at: number;
}

// ─── Sort / filter helpers ────────────────────────────────────────────────────

/**
 * Sort options available in the UI.
 * These map 1:1 to sort_by parameters accepted by the Typesense collection.
 */
export type SortOption = 'Newest' | 'Top Rated' | 'Most Reviews' | 'Most Upvoted';

/**
 * Maps a UI SortOption to its Typesense sort_by string for the protocols collection.
 *
 *   'Newest'       → newest first  (created_at, unix seconds)
 *   'Top Rated'    → highest avg rating first
 *   'Most Reviews' → most review submissions first
 *   'Most Upvoted' → highest net vote score first
 */
export const PROTOCOL_SORT_MAP: Record<SortOption, string> = {
  'Newest': 'created_at:desc',
  'Top Rated': 'rating:desc',
  'Most Reviews': 'reviews_count:desc',
  'Most Upvoted': 'votes:desc',
};

/**
 * Maps a UI SortOption to its Typesense sort_by string for the threads collection.
 *
 * NOTE: Threads have no `rating` field; 'Top Rated' falls back to votes.
 *       This matches the backend's behaviour in SearchController::threads().
 */
export const THREAD_SORT_MAP: Record<SortOption, string> = {
  'Newest': 'created_at:desc',
  'Top Rated': 'votes:desc',       // threads have no rating field → use votes
  'Most Reviews': 'comments_count:desc',
  'Most Upvoted': 'votes:desc',
};

/** Collection names as registered on the backend. */
export const COLLECTIONS = {
  PROTOCOLS: 'protocols',
  THREADS: 'threads',
} as const;
