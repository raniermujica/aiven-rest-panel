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

      setAuth: (token, user, businessSlug) => {
        localStorage.setItem('token', token);
        localStorage.setItem('businessSlug', businessSlug);
        set({
          token,
          user,
          businessSlug,
          isAuthenticated: true,
        });
      },

      login: (user, token) => {
        const businessSlug = user.business?.slug;
        localStorage.setItem('token', token);
        localStorage.setItem('businessSlug', businessSlug);
        set({
          token,
          user,
          businessSlug,
          isAuthenticated: true,
        });
      },

      // updateUser: (userData) => {
      //   set((state) => ({
      //     user: {
      //       ...state.user,
      //       ...userData,
      //     },
      //   }));
      // },

      updateBusinessName: (name) => {
        set((state) => ({
          user: {
            ...state.user,
            business: {
              ...state.user.business,
              name: name,
            },
          },
        }));
      },

      refreshUser: async () => {
        try {
          const data = await api.getMe();
          set({ user: data.user });
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