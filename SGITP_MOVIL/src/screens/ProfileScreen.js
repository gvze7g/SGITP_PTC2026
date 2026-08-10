import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { StoreHeader } from '../components/StoreHeader';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Pantalla "Perfil" (todavía sin diseño final, así que se mantiene simple):
// saluda al usuario logueado por su nombre real y permite cerrar sesión.
export function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

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
      <StoreHeader />
      <View style={styles.content}>
        <AppText variant="headingMedium" style={styles.welcome}>
          Bienvenido, {user?.full_name}
        </AppText>
        <AppText variant="muted" style={styles.subtitle}>
          Tu sesión se encuentra activa.
        </AppText>
        <View style={styles.buttonWrapper}>
          <Button label="Cerrar sesión" variant="outline" onPress={handleLogout} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  welcome: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  buttonWrapper: {
    alignSelf: 'stretch',
  },
});
