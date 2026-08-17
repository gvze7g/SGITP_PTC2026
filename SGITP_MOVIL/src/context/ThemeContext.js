import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { darkColors, lightColors } from '../constants/colors';

const THEME_STORAGE_KEY = 'sgitp_theme';

const ThemeContext = createContext(null);

// Guarda si la app está en modo claro u oscuro y expone la paleta de
// colores que le toca a cada componente según eso (ver constants/colors.js).
// La primera vez que se abre la app se usa el tema del sistema operativo;
// después, lo que el usuario elija en Configuración se guarda en el
// teléfono y gana sobre el del sistema.
export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState(systemScheme === 'dark' ? 'dark' : 'light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadStoredTheme() {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
          setTheme(stored);
        }
      } finally {
        setIsReady(true);
      }
    }

    loadStoredTheme();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const colors = theme === 'dark' ? darkColors : lightColors;

  const value = useMemo(
    () => ({ theme, colors, toggleTheme, isReady }),
    [theme, colors, toggleTheme, isReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Hook para leer los colores del tema actual desde cualquier componente,
// ej: const { colors } = useTheme();
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
