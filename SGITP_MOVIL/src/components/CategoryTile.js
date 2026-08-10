import { Pressable, StyleSheet } from 'react-native';

import { colors } from '../constants/colors';
import { AppText } from './AppText';

// Botón cuadrado con ícono + texto, usado en la fila de "Categorías" del Inicio.
export function CategoryTile({ label, icon, onPress }) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      {icon}
      <AppText variant="label" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 10,
  },
  label: {
    textAlign: 'center',
  },
});
