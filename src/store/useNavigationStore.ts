'use client';

import { create } from 'zustand';

/**
 * V8.0 Apocalypse Protocol - Navigation Sharding
 * Isolated store for UI state to prevent Ghost Re-renders when UserContext or Feed updates.
 */

interface NavigationState {
    isDrawerOpen: boolean;
    isProfileMenuOpen: boolean;
    isSuggestionsVisible: boolean;
    isReportModalOpen: boolean;
    reportType: string;
    isSidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setDrawerOpen: (open: boolean) => void;
    setProfileMenuOpen: (open: boolean) => void;
    setSuggestionsVisible: (visible: boolean) => void;
    setReportModalOpen: (open: boolean, type?: string) => void;
    closeAll: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    isDrawerOpen: false,
    isProfileMenuOpen: false,
    isSuggestionsVisible: false,
    isReportModalOpen: false,
    reportType: 'bug',
    isSidebarCollapsed: false,
    setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
    setDrawerOpen: (open) => set({ isDrawerOpen: open }),
    setProfileMenuOpen: (open) => set({ isProfileMenuOpen: open }),
    setSuggestionsVisible: (visible) => set({ isSuggestionsVisible: visible }),
    setReportModalOpen: (open, type = 'bug') => set({ isReportModalOpen: open, reportType: type }),
    closeAll: () => set({
        isDrawerOpen: false,
        isProfileMenuOpen: false,
        isSuggestionsVisible: false,
        isReportModalOpen: false,
        reportType: 'bug'
    }),
}));
