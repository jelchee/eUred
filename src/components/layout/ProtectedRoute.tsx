import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store';
import { canAccessRoute } from '@/lib/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard for authenticated routes.
 * - If not authenticated → redirect to /login
 * - If authenticated but role not allowed → redirect to /dashboard
 * - Otherwise render children
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentRole, isAuthenticated } = useAppStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const result = canAccessRoute(location.pathname, currentRole);

  if (!result.allowed) {
    // PUBLIC_VIEWER should go to public passport, not loop back to login/dashboard
    if (currentRole === 'PUBLIC_VIEWER') {
      return <Navigate to="/public/passport/BP-HR-RE-SEST-2026-0001" replace />;
    }
    return <Navigate to={result.redirect ?? '/dashboard'} replace />;
  }

  return <>{children}</>;
}
