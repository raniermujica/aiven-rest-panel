import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      businessSlug: null,
      isAuthenticated: false,

      login: (userData, token) => {
        console.log('🔐 Login en authStore - userData:', userData);
        console.log('🏢 Business:', userData.business);
        
        const businessSlug = userData.business?.slug || null;
        
        localStorage.setItem('token', token);
        if (businessSlug) {
          localStorage.setItem('businessSlug', businessSlug);
        }
        
        set({
          token,
          user: userData,
          businessSlug,
          isAuthenticated: true,
        });
      },

      updateBusinessName: (name) => {
        set((state) => ({
          user: {
            ...state.user,
            business: {
              ...state.user?.business,
              name: name,
            },
          },
        }));
      },

      refreshUser: async () => {
        try {
          const data = await api.getMe();
          console.log('♻️ Refresh user - data:', data);
          
          set((state) => ({ 
            user: data.user,
            businessSlug: data.user?.business?.slug || state.businessSlug
          }));
        } catch (error) {
          console.error('Error refrescando usuario:', error);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('businessSlug');
        set({
          user: null,
          token: null,
          businessSlug: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);