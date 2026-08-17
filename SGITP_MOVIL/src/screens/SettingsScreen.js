import { useMemo } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon } from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { IconBadge } from '../components/IconBadge';
import { ScreenHeader } from '../components/ScreenHeader';
import { useTheme } from '../context/ThemeContext';

// Pantalla "Configuración": por ahora solo tiene el modo oscuro (real,
// persistido en el teléfono, ver ThemeContext.js). No hay mockup ni
// backend de preferencias de cuenta/notificaciones todavía, así que no se
// agregó nada más para no simular ajustes que no hacen nada.
export function SettingsScreen({ navigation }) {
  const { theme, colors, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <AppText variant="headingMedium" style={styles.title}>
          Configuración
        </AppText>
        <AppText variant="muted" style={styles.subtitle}>
          Preferencias de la aplicación.
        </AppText>

        <View style={styles.row}>
          <IconBadge size={44}>
            <Moon size={18} color={colors.text} />
          </IconBadge>
          <View style={styles.rowText}>
            <AppText variant="bodySemiBold">Modo oscuro</AppText>
            <AppText variant="muted" style={styles.rowSubtitle}>
              {isDark ? 'Activado' : 'Usa la paleta clara de la app'}
            </AppText>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.borderStrong }}
            thumbColor={isDark ? colors.black : colors.background}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    title: {
      marginTop: 4,
    },
    subtitle: {
      marginTop: 4,
      marginBottom: 24,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
    },
    rowText: {
      flex: 1,
    },
    rowSubtitle: {
      marginTop: 2,
      fontSize: 12,
    },
  });
}
