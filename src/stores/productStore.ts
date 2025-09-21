import { create } from 'zustand';
import { IProduct, ICategory } from '@/types/store';
import { apiService } from '@/services/api';

interface ProductStore {
  products: IProduct[];
  categories: ICategory[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  
  // Actions
  fetchProducts: (categoryId?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (categoryId: string | null) => void;
  clearError: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null,

  fetchProducts: async (categoryId?: string) => {
    set({ loading: true, error: null });
    try {
      const products = await apiService.getProducts({ categoryId });
      set({ products, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar productos',
        loading: false 
      });
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await apiService.getCategories();
      set({ categories, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar categorías',
        loading: false 
      });
    }
  },

  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategory: categoryId });
    // Automatically fetch products for the selected category
    get().fetchProducts(categoryId || undefined);
  },

  clearError: () => set({ error: null }),
}));