import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  CreditCard,
  LogOut,
  MapPin,
  Package,
  Settings,
  User,
} from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { IconBadge } from '../components/IconBadge';
import { StoreHeader } from '../components/StoreHeader';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

// Saca las iniciales del nombre completo para el círculo de avatar
// (no hay foto de perfil todavía: no existe esa parte en el backend).
function getInitials(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

// Filas del menú de Perfil (ver targetScreen para saber a dónde lleva cada una).
const MENU_ITEMS = [
  {
    icon: User,
    title: 'Mis Datos',
    subtitle: 'Información personal y contacto',
    targetScreen: 'EditProfile',
  },
  {
    icon: Package,
    title: 'Órdenes Recientes',
    subtitle: 'Historial de compras y seguimientos',
    targetScreen: 'Orders',
  },
  {
    icon: MapPin,
    title: 'Direcciones Guardadas',
    subtitle: 'Gestiona tus lugares de entrega',
    targetScreen: 'Addresses',
  },
  {
    icon: CreditCard,
    title: 'Métodos de Pago',
    subtitle: 'Tarjetas y preferencias de facturación',
    targetScreen: 'PaymentMethods',
  },
  {
    icon: Settings,
    title: 'Configuración',
    subtitle: 'Notificaciones y preferencias de cuenta',
    targetScreen: 'Settings',
  },
];

export function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showToast } = useToast();

  // user.createdAt solo llega cuando el dato viene de /auth/me (al abrir la
  // app); justo después de iniciar sesión todavía no está, así que la
  // línea "Miembro desde" se oculta en ese caso en vez de mostrar basura.
  const memberSinceYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : null;

  function handleComingSoon() {
    showToast('Próximamente', 'success');
  }

  function handleMenuPress(item) {
    if (item.targetScreen) {
      navigation.navigate(item.targetScreen);
    } else {
      handleComingSoon();
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigation.getParent()?.replace('Login');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <StoreHeader />

        <View style={styles.profileHeader}>
          <IconBadge size={112} backgroundColor={colors.cardTan}>
            <AppText variant="headingMedium" style={styles.avatarInitials}>
              {getInitials(user?.full_name)}
            </AppText>
          </IconBadge>

          <AppText variant="headingMedium" style={styles.name}>
            {user?.full_name}
          </AppText>
          {memberSinceYear ? (
            <AppText variant="muted" style={styles.since}>
              Miembro desde {memberSinceYear}
            </AppText>
          ) : null}

          <View style={styles.editButtonWrapper}>
            <Button
              label="Editar Perfil"
              variant="primary"
              onPress={() => navigation.navigate('EditProfile')}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <Pressable key={item.title} style={styles.menuItem} onPress={() => handleMenuPress(item)}>
              <IconBadge size={44}>
                <item.icon size={18} color={colors.text} />
              </IconBadge>
              <View style={styles.menuItemText}>
                <AppText variant="bodySemiBold">{item.title}</AppText>
                <AppText variant="muted" style={styles.menuItemSubtitle}>
                  {item.subtitle}
                </AppText>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <View style={styles.logoutWrapper}>
          <Button
            label="Cerrar Sesión"
            variant="outline"
            icon={<LogOut size={16} color={colors.error} />}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    profileHeader: {
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 24,
    },
    avatarInitials: {
      fontSize: 30,
    },
    name: {
      marginTop: 20,
      textAlign: 'center',
    },
    since: {
      marginTop: 4,
    },
    editButtonWrapper: {
      alignSelf: 'stretch',
      marginTop: 20,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 20,
    },
    menu: {
      paddingHorizontal: 20,
      paddingTop: 20,
      gap: 12,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
    },
    menuItemText: {
      flex: 1,
    },
    menuItemSubtitle: {
      marginTop: 2,
      fontSize: 12,
    },
    logoutWrapper: {
      padding: 20,
      paddingBottom: 32,
    },
  });
}
