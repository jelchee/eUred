import type { StateCreator } from 'zustand';
import type { UserRole, DemoUser } from '@/types';
import { users } from '@/data/users';

// ============================================================
// AUTH SLICE
// ============================================================

export interface AuthSlice {
  currentRole: UserRole;
  currentUser: DemoUser | null;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  login: (user: DemoUser) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [['zustand/immer', never]], [], AuthSlice> = (
  set
) => ({
  currentRole: 'PUBLIC_VIEWER',
  currentUser: null,
  isAuthenticated: false,

  setRole: (role: UserRole) => {
    const matchingUser = users.find((u) => u.role === role) ?? null;
    set((state) => {
      state.currentRole = role;
      state.currentUser = matchingUser;
      state.isAuthenticated = matchingUser !== null;
    });
  },

  login: (user: DemoUser) => {
    set((state) => {
      state.currentUser = user;
      state.currentRole = user.role;
      state.isAuthenticated = true;
    });
  },

  logout: () => {
    set((state) => {
      state.currentRole = 'PUBLIC_VIEWER';
      state.currentUser = null;
      state.isAuthenticated = false;
    });
  },
});
