import { create } from 'zustand';

interface DepartmentFilterState {
    selectedResearchers: string[];
    toggleResearcher: (id: string) => void;
    clearFilters: () => void;
}

export const useDepartmentFilterStore = create<DepartmentFilterState>((set) => ({
    selectedResearchers: [],
    toggleResearcher: (id) => set((state) => {
        const isSelected = state.selectedResearchers.includes(id);
        if (isSelected) {
            return { selectedResearchers: state.selectedResearchers.filter(r => r !== id) };
        } else {
            return { selectedResearchers: [...state.selectedResearchers, id] };
        }
    }),
    clearFilters: () => set({ selectedResearchers: [] })
}));
