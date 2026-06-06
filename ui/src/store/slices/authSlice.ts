import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingUser: boolean;
}

const TOKEN_KEY = 'auth_token';

const initialState: AuthState = {
  user: null,
  // Rehydrate token from localStorage on cold start
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  isLoadingUser: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem(TOKEN_KEY, action.payload.token);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setLoadingUser: (state, action: PayloadAction<boolean>) => {
      state.isLoadingUser = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoadingUser = false;
      localStorage.removeItem(TOKEN_KEY);
    },
  },
});

export const { setCredentials, setUser, setLoadingUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
