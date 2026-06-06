import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiError } from '../types/api';

interface UseFetchOptions {
  /**
   * When false the fetch will not run automatically. Useful for lazy fetches
   * that should only trigger on user action.
   */
  enabled?: boolean;
  /** Dependencies that trigger a re-fetch when they change (similar to useEffect deps). */
  deps?: unknown[];
}

interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  /** Manually trigger a refetch */
  refetch: () => void;
}

/**
 * useFetch
 *
 * Generic hook for GET requests. Manages loading, error, and data state.
 * Automatically cancels in-flight requests on unmount or dep change.
 *
 * @param fetcher - An async function that returns the data (e.g. `() => protocolService.list()`)
 * @param options - `enabled` flag and extra `deps` array
 *
 * @example
 * const { data, isLoading, error, refetch } = useFetch(() => protocolService.list());
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions = {},
): UseFetchResult<T> {
  const { enabled = true, deps = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);

  // Keep a stable ref to the fetcher to avoid stale closures
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetcherRef.current();
        if (!cancelled && isMounted.current) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled && isMounted.current) {
          setError(err as ApiError);
        }
      } finally {
        if (!cancelled && isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tick, ...deps]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, isLoading, error, refetch };
}
