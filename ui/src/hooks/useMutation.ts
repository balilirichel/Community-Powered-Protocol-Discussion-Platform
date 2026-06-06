import { useState, useCallback, useRef } from 'react';
import type { ApiError } from '../types/api';

interface UseMutationOptions<TData, TVariables> {
  /**
   * Called immediately before the mutation fires with a temporary optimistic result.
   * Return value will replace `data` until the real response arrives.
   */
  onMutate?: (variables: TVariables) => TData | undefined;
  /** Called on successful response */
  onSuccess?: (data: TData, variables: TVariables) => void;
  /** Called when the mutation throws */
  onError?: (error: ApiError, variables: TVariables, rollbackData?: TData) => void;
  /** Called after either success or error */
  onSettled?: (data: TData | null, error: ApiError | null, variables: TVariables) => void;
}

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | null>;
  data: TData | null;
  isLoading: boolean;
  error: ApiError | null;
  reset: () => void;
}

/**
 * useMutation
 *
 * Generic hook for POST / PUT / PATCH / DELETE requests.
 * Supports optimistic updates via `onMutate` with automatic rollback on error.
 *
 * @param mutationFn - Async function that receives variables and performs the API call
 * @param options    - Lifecycle callbacks (onMutate, onSuccess, onError, onSettled)
 *
 * @example
 * const { mutate, isLoading, error } = useMutation(
 *   (data: CreateProtocolRequest) => protocolService.create(data),
 *   { onSuccess: (protocol) => console.log('created', protocol) }
 * );
 */
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {},
): UseMutationResult<TData, TVariables> {
  const { onMutate, onSuccess, onError, onSettled } = options;

  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Stable ref so callbacks don't cause re-renders
  const optionsRef = useRef({ onMutate, onSuccess, onError, onSettled });
  optionsRef.current = { onMutate, onSuccess, onError, onSettled };

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      setIsLoading(true);
      setError(null);

      // ─── Optimistic update ──────────────────────────────────────────
      let rollbackData: TData | undefined;
      if (optionsRef.current.onMutate) {
        rollbackData = optionsRef.current.onMutate(variables);
        if (rollbackData !== undefined) {
          setData(rollbackData);
        }
      }

      try {
        const result = await mutationFn(variables);
        setData(result);
        optionsRef.current.onSuccess?.(result, variables);
        optionsRef.current.onSettled?.(result, null, variables);
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);

        // Roll back optimistic data if provided
        if (rollbackData !== undefined) {
          setData(rollbackData);
        } else {
          setData(null);
        }

        optionsRef.current.onError?.(apiError, variables, rollbackData);
        optionsRef.current.onSettled?.(null, apiError, variables);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, data, isLoading, error, reset };
}
