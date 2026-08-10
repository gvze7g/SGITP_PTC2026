import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
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

// Punto de entrada de la app. Se mantiene chiquito a propósito: cada
// "Provider" le da a toda la app acceso a algo (sesión, avisos, navegación)
// y la pantalla real que se ve vive en RootNavigator.
export default function App() {
  useAppReady(); // carga las fuentes Montserrat/Manrope y oculta la pantalla de carga cuando ya están listas

  return (
    // Necesario para que funcionen los gestos (deslizar para volver atrás, etc.)
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Le avisa a toda la app dónde están el notch, la barra de estado, etc. */}
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {/* Guarda quién es el usuario logueado */}
          <AuthProvider>
            {/* Permite mostrar los avisos (toasts) desde cualquier pantalla */}
            <ToastProvider>
              {/* Guarda qué productos se marcaron como favoritos */}
              <FavoritesProvider>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
                <StatusBar style="dark" />
              </FavoritesProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
