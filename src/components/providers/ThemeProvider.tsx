'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Aplicar el tema al montar el componente
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    // Verificar si hay un tema guardado en localStorage al inicializar
    const savedTheme = localStorage.getItem('rano-theme-storage');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.state?.theme) {
          setTheme(parsed.state.theme);
        }
      } catch (error) {
        console.warn('Error parsing saved theme:', error);
      }
    }
  }, [setTheme]);

  return <>{children}</>;
};

export default ThemeProvider;