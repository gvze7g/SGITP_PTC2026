import { StyleSheet, View } from 'react-native';

import { colors } from '../constants/colors';

// Círculo de color con un ícono adentro (ej. el sobre en Verificar Código,
// el candado en Recuperar Acceso). "size" es el diámetro del círculo.
export function IconBadge({ children, size = 72, backgroundColor = colors.surface }) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
