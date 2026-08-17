import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';

// Círculo de color con un ícono adentro (ej. el sobre en Verificar Código,
// el candado en Recuperar Acceso). "size" es el diámetro del círculo.
export function IconBadge({ children, size = 72, backgroundColor }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor ?? colors.surface,
        },
      ]}
    >
      {children}
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    badge: {
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
  });
}
