import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function ThemeProvider({ children }) {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.business?.type) {
      applyBusinessTheme(user.business.type);
    }
  }, [user]);

  return <>{children}</>;
}

function applyBusinessTheme(businessType) {
  const themes = {
    restaurant: {
      primary: 'rgb(37, 99, 235)',
      primaryHover: 'rgb(29, 78, 216)',
      sidebar: 'rgb(17, 24, 39)',
    },
    beauty_salon: {
      primary: 'rgb(236, 72, 153)',
      primaryHover: 'rgb(219, 39, 119)',
      sidebar: 'rgb(131, 24, 67)',
    },
    aesthetic_clinic: {
      primary: 'rgb(168, 85, 247)',
      primaryHover: 'rgb(147, 51, 234)',
      sidebar: 'rgb(88, 28, 135)',
    },
    dental_clinic: {
      primary: 'rgb(20, 184, 166)',
      primaryHover: 'rgb(13, 148, 136)',
      sidebar: 'rgb(17, 94, 89)',
    },
    barbershop: {
      primary: 'rgb(245, 158, 11)',
      primaryHover: 'rgb(217, 119, 6)',
      sidebar: 'rgb(120, 53, 15)',
    },
  };

  const theme = themes[businessType] || themes.restaurant;
  
  document.documentElement.style.setProperty('--color-primary', theme.primary);
  document.documentElement.style.setProperty('--color-primary-hover', theme.primaryHover);
  document.documentElement.style.setProperty('--color-sidebar', theme.sidebar);
};