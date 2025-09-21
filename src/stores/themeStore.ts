'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface IThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<IThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme: Theme) => {
        set({ theme });
        // Aplicar el tema al documento
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
          // Forzar re-render para evitar problemas de hidratación
          document.documentElement.style.colorScheme = theme;
        }
      },
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'rano-theme-storage',
      onRehydrateStorage: () => (state) => {
        // Aplicar el tema al cargar desde localStorage
        if (state && typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', state.theme);
          document.documentElement.style.colorScheme = state.theme;
        }
      },
    }
  )
);