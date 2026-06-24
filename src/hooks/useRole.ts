import { useAppStore } from '@/store';
import { ROLE_PERMISSION_MAP } from '@/lib/permissions';
import type { Permission } from '@/types';

/**
 * Typed selector hook for role and authentication state.
 * Provides the current role, user, authentication helpers, and permission checks.
 */
export function useRole() {
  const currentRole = useAppStore((s) => s.currentRole);
  const currentUser = useAppStore((s) => s.currentUser);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setRole = useAppStore((s) => s.setRole);
  const login = useAppStore((s) => s.login);
  const logout = useAppStore((s) => s.logout);

  const permissions = ROLE_PERMISSION_MAP[currentRole];

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  return {
    currentRole,
    currentUser,
    isAuthenticated,
    setRole,
    login,
    logout,
    permissions,
    hasPermission,
  };
}
