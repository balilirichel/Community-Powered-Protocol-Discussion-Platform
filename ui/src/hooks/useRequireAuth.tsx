import { useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { useAuthModal } from '../components/auth/AuthModalContext';

export const useRequireAuth = () => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { open } = useAuthModal();

  const guard = useCallback((fn: (...args: any[]) => any) => {
    return (...args: any[]) => {
      if (isAuthenticated) {
        return fn(...args);
      }
      open();
      return undefined;
    };
  }, [isAuthenticated, open]);

  return { isAuthenticated, guard, open };
};

export default useRequireAuth;
