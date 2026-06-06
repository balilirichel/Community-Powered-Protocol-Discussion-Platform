import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ApiError } from '../../types/api';

interface UiState {
  globalError: ApiError | null;
  /** Map of request keys → loading state. Key can be any string identifier (e.g. 'protocols/list'). */
  loadingKeys: Record<string, boolean>;
}

const initialState: UiState = {
  globalError: null,
  loadingKeys: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalError: (state, action: PayloadAction<ApiError | null>) => {
      state.globalError = action.payload;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    setLoading: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
      state.loadingKeys[action.payload.key] = action.payload.value;
    },
  },
});

export const { setGlobalError, clearGlobalError, setLoading } = uiSlice.actions;
export default uiSlice.reducer;
