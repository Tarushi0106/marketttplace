import { create } from "zustand";

interface UIState {
  // Search modal
  isSearchOpen: boolean;
  setSearchOpen: (isOpen: boolean) => void;
  toggleSearch: () => void;

  // Mobile menu
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
  toggleMobileMenu: () => void;

  // Filters
  isFiltersOpen: boolean;
  setFiltersOpen: (isOpen: boolean) => void;
  toggleFilters: () => void;

  // Comparison
  comparisonItems: string[];
  addToComparison: (productId: string) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isComparisonOpen: boolean;
  setComparisonOpen: (isOpen: boolean) => void;

  // Quick view
  quickViewProduct: string | null;
  setQuickViewProduct: (productId: string | null) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Search modal
  isSearchOpen: false,
  setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
  toggleSearch: () => set({ isSearchOpen: !get().isSearchOpen }),

  // Mobile menu
  isMobileMenuOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),

  // Filters
  isFiltersOpen: false,
  setFiltersOpen: (isOpen) => set({ isFiltersOpen: isOpen }),
  toggleFilters: () => set({ isFiltersOpen: !get().isFiltersOpen }),

  // Comparison
  comparisonItems: [],
  addToComparison: (productId) => {
    const items = get().comparisonItems;
    if (items.length < 4 && !items.includes(productId)) {
      set({ comparisonItems: [...items, productId] });
    }
  },
  removeFromComparison: (productId) => {
    set({
      comparisonItems: get().comparisonItems.filter((id) => id !== productId),
    });
  },
  clearComparison: () => set({ comparisonItems: [] }),
  isComparisonOpen: false,
  setComparisonOpen: (isOpen) => set({ isComparisonOpen: isOpen }),

  // Quick view
  quickViewProduct: null,
  setQuickViewProduct: (productId) => set({ quickViewProduct: productId }),
}));
