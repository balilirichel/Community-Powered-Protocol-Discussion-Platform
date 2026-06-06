import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * PublicRoute
 *
 * Wraps public routes (login, register).
 * - If already authenticated, redirects to home
 * - If not authenticated, renders the children
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
