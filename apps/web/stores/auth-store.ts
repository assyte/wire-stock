'use client';

import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import api, { tokenStorage } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    businessType: string;
    plan: string;
    currency: string;
    logoUrl?: string;
  };
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearAuth: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  businessType: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { accessToken, refreshToken, user } = response.data.data;

          tokenStorage.setAccessToken(accessToken);
          tokenStorage.setRefreshToken(refreshToken);

          set({ user, isAuthenticated: true, isLoading: false });
          toast.success(`Hoş geldin, ${user.firstName}!`);
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', data);
          const { accessToken, refreshToken, user } = response.data.data;

          tokenStorage.setAccessToken(accessToken);
          tokenStorage.setRefreshToken(refreshToken);

          set({ user, isAuthenticated: true, isLoading: false });
          toast.success('Hesabın başarıyla oluşturuldu!');
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (e) {
          // Hata olsa da devam et
        }
        get().clearAuth();
        toast.success('Çıkış yapıldı');
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/auth/me');
          const user = response.data.data;
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false, isAuthenticated: false, user: null });
        }
      },

      clearAuth: () => {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'wirestock-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
