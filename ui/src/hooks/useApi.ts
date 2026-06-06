import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setGlobalError, clearGlobalError } from '../store/slices/uiSlice';
import type { ApiError } from '../types/api';

/**
 * useApi
 *
 * Provides access to global API state (error, loading keys) and
 * helpers to clear errors or read named loading states.
 *
 * Use this in layout-level error boundaries or toast systems.
 *
 * @example
 * const { globalError, dismissError } = useApi();
 */
export function useApi() {
  const dispatch = useAppDispatch();
  const { globalError, loadingKeys } = useAppSelector((s) => s.ui);

  const dismissError = () => dispatch(clearGlobalError());

  const setError = (error: ApiError | null) => dispatch(setGlobalError(error));

  const isKeyLoading = (key: string) => loadingKeys[key] ?? false;

  return { globalError, loadingKeys, dismissError, setError, isKeyLoading };
}
