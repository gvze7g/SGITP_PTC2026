import { StatusBar } from 'expo-status-bar';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
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
import { SessionGuard } from './src/navigation/SessionGuard';

// Le decimos a la app que mantenga la pantalla de carga nativa visible
// hasta que nosotros digamos que ya está lista (esto se hace 1 sola vez,
// fuera del componente, apenas arranca la app).
SplashScreen.preventAutoHideAsync();

// React Query guarda en caché lo que se pide al backend (ej. la lista de
// productos) para no repetir la misma petición una y otra vez.
// Ajustes para no saturar el backend: los datos se consideran frescos 1
// minuto (cambiar de pantalla no vuelve a pedirlos) y solo se reintenta ante
// fallas de red, nunca ante una respuesta del servidor (un 429 o 400
// reintentado solo empeora la carga).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error) => !error?.status && failureCount < 2,
    },
    mutations: {
      retry: false,
    },
  },
});

// Referencia a la navegación para que SessionGuard pueda sacar al usuario al
// Login cuando se queda sin sesión, esté en la pantalla que esté.
const navigationRef = createNavigationContainerRef();

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
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <RootNavigator />
      <SessionGuard navigationRef={navigationRef} />
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
