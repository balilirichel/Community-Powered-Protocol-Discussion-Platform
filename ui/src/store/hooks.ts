import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/** Pre-typed version of useDispatch */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Pre-typed version of useSelector */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
