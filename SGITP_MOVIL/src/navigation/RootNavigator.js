import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { NewPasswordScreen } from '../screens/NewPasswordScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { VerifyCodeScreen } from '../screens/VerifyCodeScreen';
import { MainTabNavigator } from './MainTabNavigator';

const Stack = createNativeStackNavigator();

// Todas las pantallas de la app y en qué orden se puede navegar entre ellas.
// "MainTabs" es el menú de abajo (Inicio/Colección/Favoritos/Perfil) con
// sus propias 4 pantallas adentro; "ProductDetail" vive aquí afuera para
// que al abrir un producto el menú de abajo desaparezca (pantalla completa).
// headerShown: false porque cada pantalla arma su propio encabezado
// (ver los componentes ScreenHeader y StoreHeader) en vez de usar el de React Navigation.
export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
