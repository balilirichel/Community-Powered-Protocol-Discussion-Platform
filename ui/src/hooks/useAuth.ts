import { useCallback } from 'react';
import { authService } from '../api/authService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials, setUser, setLoadingUser, clearAuth } from '../store/slices/authSlice';
import type { LoginRequest, RegisterRequest } from '../types/auth';
import type { ApiError } from '../types/api';

/**
 * useAuth
 *
 * Provides login, register, logout, and fetchUser actions.
 * Auth state (user, isAuthenticated, isLoadingUser) is read directly from Redux.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoadingUser } = useAppSelector((s) => s.auth);

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      const response = await authService.login(credentials);
      dispatch(setCredentials({ user: response.data.user, token: response.data.token }));
    },
    [dispatch],
  );

  const register = useCallback(
    async (data: RegisterRequest): Promise<void> => {
      const response = await authService.register(data);
      dispatch(setCredentials({ user: response.data.user, token: response.data.token }));
    },
    [dispatch],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      // Always clear local state even if the server request fails
      dispatch(clearAuth());
    }
  }, [dispatch]);

  /**
   * Fetch the currently authenticated user from the API.
   * Useful on app mount to rehydrate user data when a stored token exists.
   */
  const fetchUser = useCallback(async (): Promise<void> => {
    if (!token) return;
    dispatch(setLoadingUser(true));
    try {
      const currentUser = await authService.getUser();
      dispatch(setUser(currentUser));
    } catch (error) {

      throw error as ApiError;
    } finally {
      dispatch(setLoadingUser(false));
    }
  }, [dispatch, token]);

  return { user, token, isAuthenticated, isLoadingUser, login, register, logout, fetchUser };
}
