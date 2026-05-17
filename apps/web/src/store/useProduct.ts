import { create } from 'zustand';
import { Product, Category, ProductFilters } from '@ecom/types';
import api from '@/lib/axios';

interface ProductState {
  products: Product[];
  categories: Category[];
  totalProducts: number;
  exchangeRate: number;
  settings: Record<string, string>;
  isLoading: boolean;
  
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchExchangeRate: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  getProduct: (id: string) => Promise<Product>;
  createProduct: (data: FormData) => Promise<void>;
  updateProduct: (id: string, data: FormData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProduct = create<ProductState>((set) => ({
  products: [],
  categories: [],
  totalProducts: 0,
  exchangeRate: 95, // Default
  settings: {},
  isLoading: false,

  fetchProducts: async (filters) => {
    const state = useProduct.getState();
    // If we already have products and no active filter query, return immediately and refetch silently in background
    if (state.products.length > 0 && !filters) {
      try {
        const res = await api.get<{ products: Product[], total: number }>('/products');
        set({ 
          products: res.data.products, 
          totalProducts: res.data.total
        });
      } catch (error) {}
      return;
    }

    set({ isLoading: true });
    try {
      const res = await api.get<{ products: Product[], total: number }>('/products', { params: filters });
      set({ 
        products: res.data.products, 
        totalProducts: res.data.total, 
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    const state = useProduct.getState();
    // Cache categories permanently in memory since they change very rarely
    if (state.categories.length > 0) return;

    try {
      const res = await api.get<Category[]>('/products/categories');
      set({ categories: res.data });
    } catch (error) {}
  },

  fetchExchangeRate: async () => {
    const state = useProduct.getState();
    // Cache exchange rate (default is 95, so if it has been fetched or changed, bypass network call)
    if (state.exchangeRate !== 95) return;

    try {
      const res = await api.get<{ rate: number }>('/products/rate');
      set({ exchangeRate: res.data.rate });
    } catch (error) {}
  },

  fetchSettings: async () => {
    const state = useProduct.getState();
    // Cache CMS site configuration settings
    if (Object.keys(state.settings).length > 0) return;

    try {
      const res = await api.get<Record<string, string>>('/products/settings');
      set({ settings: res.data });
    } catch (error) {}
  },

  getProduct: async (id) => {
    const res = await api.get<Product>(`/products/${id}`);
    return res.data;
  },

  createProduct: async (formData) => {
    await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateProduct: async (id, formData) => {
    await api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
  }
}));
