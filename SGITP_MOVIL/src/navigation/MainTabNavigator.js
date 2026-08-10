import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Heart, House, LayoutGrid, User } from 'lucide-react-native';

import { colors } from '../constants/colors';
import { fontFamily } from '../constants/typography';
import { CollectionScreen } from '../screens/CollectionScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeStoreScreen } from '../screens/HomeStoreScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Qué ícono le toca a cada pestaña del menú de abajo.
const TAB_ICONS = {
  Inicio: House,
  Colección: LayoutGrid,
  Favoritos: Heart,
  Perfil: User,
};

// Menú de navegación principal (aparece después de iniciar sesión): las 4
// secciones de la tienda, siempre visibles abajo de la pantalla.
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.bodySemiBold,
          fontSize: 10,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
        tabBarIcon: ({ color, size }) => {
          const Icon = TAB_ICONS[route.name];
          return <Icon color={color} size={size ?? 22} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStoreScreen} />
      <Tab.Screen name="Colección" component={CollectionScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
