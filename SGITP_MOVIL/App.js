import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import { useAppReady } from './src/hooks/useAppReady';
import { RootNavigator } from './src/navigation/RootNavigator';

// Le decimos a la app que mantenga la pantalla de carga nativa visible
// hasta que nosotros digamos que ya está lista (esto se hace 1 sola vez,
// fuera del componente, apenas arranca la app).
SplashScreen.preventAutoHideAsync();

// React Query guarda en caché lo que se pide al backend (ej. la lista de
// productos) para no repetir la misma petición una y otra vez.
const queryClient = new QueryClient();

// Vive adentro de ThemeProvider para poder leer el tema activo: le pasa los
// colores correctos a la barra de estado del teléfono y al fondo que usa
// React Navigation entre pantallas (si no, se ve un flash blanco al
// navegar en modo oscuro).
function AppContent() {
  const { theme, colors } = useTheme();

  const navigationTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

// Punto de entrada de la app. Se mantiene chiquito a propósito: cada
// "Provider" le da a toda la app acceso a algo (sesión, avisos, tema,
// navegación) y la pantalla real que se ve vive en RootNavigator.
export default function App() {
  useAppReady(); // carga las fuentes Montserrat/Manrope y oculta la pantalla de carga cuando ya están listas

  return (
    // Necesario para que funcionen los gestos (deslizar para volver atrás, etc.)
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Le avisa a toda la app dónde están el notch, la barra de estado, etc. */}
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {/* Guarda si la app está en modo claro u oscuro */}
          <ThemeProvider>
            {/* Guarda quién es el usuario logueado */}
            <AuthProvider>
              {/* Permite mostrar los avisos (toasts) desde cualquier pantalla */}
              <ToastProvider>
                {/* Guarda qué productos se marcaron como favoritos */}
                <FavoritesProvider>
                  <AppContent />
                </FavoritesProvider>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
