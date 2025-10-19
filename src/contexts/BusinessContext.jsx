import { createContext, useContext, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const { user } = useAuthStore();
  const [businessTheme, setBusinessTheme] = useState(null);

  useEffect(() => {
    if (user?.business) {
      const theme = getBusinessTheme(user.business.type);
      setBusinessTheme(theme);
      
      // Aplicar CSS variables al root
      applyTheme(theme);
    }
  }, [user]);

  return (
    <BusinessContext.Provider value={{ businessTheme }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessTheme() {
  return useContext(BusinessContext);
}

function getBusinessTheme(businessType) {
  const themes = {
    restaurant: {
      primary: '#2563eb',      // Blue
      secondary: '#dbeafe',
      accent: '#1e40af',
      gradient: 'from-blue-50 to-blue-100',
      icon: '🍽️',
      name: 'Restaurante'
    },
    beauty_salon: {
      primary: '#ec4899',      // Pink
      secondary: '#fce7f3',
      accent: '#db2777',
      gradient: 'from-pink-50 to-pink-100',
      icon: '💅',
      name: 'Salón de Belleza'
    },
    aesthetic_clinic: {
      primary: '#a855f7',      // Purple
      secondary: '#f3e8ff',
      accent: '#9333ea',
      gradient: 'from-purple-50 to-purple-100',
      icon: '✨',
      name: 'Clínica Estética'
    },
    dental_clinic: {
      primary: '#14b8a6',      // Teal
      secondary: '#ccfbf1',
      accent: '#0d9488',
      gradient: 'from-teal-50 to-teal-100',
      icon: '🦷',
      name: 'Clínica Dental'
    },
    barbershop: {
      primary: '#f59e0b',      // Amber
      secondary: '#fef3c7',
      accent: '#d97706',
      gradient: 'from-amber-50 to-amber-100',
      icon: '💈',
      name: 'Barbería'
    },
  };

  return themes[businessType] || themes.restaurant;
}

function applyTheme(theme) {
  const root = document.documentElement;
  
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-accent', theme.accent);
};