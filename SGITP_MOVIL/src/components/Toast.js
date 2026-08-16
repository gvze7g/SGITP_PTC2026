import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { AppText } from './AppText';

// Aviso que aparece arriba de la pantalla (ej. "Bienvenido, Ana" o un
// error). No se usa directamente en las pantallas: lo maneja ToastContext.
export function Toast({ visible, message, tone = 'error' }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Color de fondo del aviso según el tipo de mensaje.
  const toneColors = { success: colors.success, error: colors.error };
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { top: insets.top + 12, opacity, backgroundColor: toneColors[tone] },
      ]}
    >
      <AppText variant="bodySemiBold" style={styles.text}>
        {message}
      </AppText>
    </Animated.View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      left: 20,
      right: 20,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      zIndex: 999,
      elevation: 6,
    },
    text: {
      color: '#FFFFFF',
      textAlign: 'center',
    },
  });
}
