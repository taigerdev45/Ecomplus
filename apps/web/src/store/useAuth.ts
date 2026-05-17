import { create } from 'zustand';
import { User, LoginDTO, RegisterDTO } from '@ecom/types';
import api from '@/lib/axios';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post<{ user: User; accessToken: string }>('/auth/login', data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', res.data.accessToken);
        document.cookie = `accessToken=${res.data.accessToken}; path=/; max-age=604800; samesite=lax`;
      }
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post<{ user: User; accessToken: string }>('/auth/register', data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', res.data.accessToken);
        document.cookie = `accessToken=${res.data.accessToken}; path=/; max-age=604800; samesite=lax`;
      }
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const res = await api.get<{ user: User }>('/auth/me');
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
