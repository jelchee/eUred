interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper for public routes (landing, public passport, login).
 * No authentication check needed — renders children directly.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  return <>{children}</>;
}
