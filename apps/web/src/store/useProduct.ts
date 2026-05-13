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
    try {
      const res = await api.get<Category[]>('/products/categories');
      set({ categories: res.data });
    } catch (error) {}
  },

  fetchExchangeRate: async () => {
    try {
      const res = await api.get<{ rate: number }>('/products/rate');
      set({ exchangeRate: res.data.rate });
    } catch (error) {}
  },

  fetchSettings: async () => {
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
