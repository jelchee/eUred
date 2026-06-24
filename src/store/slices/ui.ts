import type { StateCreator } from 'zustand';

// ============================================================
// UI SLICE
// ============================================================

export interface UISlice {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  toggleMobileNav: () => void;
}

export const createUISlice: StateCreator<UISlice, [['zustand/immer', never]], [], UISlice> = (
  set
) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileNavOpen: false,

  toggleSidebar: () => {
    set((state) => {
      state.sidebarOpen = !state.sidebarOpen;
    });
  },

  collapseSidebar: () => {
    set((state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    });
  },

  toggleMobileNav: () => {
    set((state) => {
      state.mobileNavOpen = !state.mobileNavOpen;
    });
  },
});
