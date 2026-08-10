import { Pressable, StyleSheet } from 'react-native';

import { colors } from '../constants/colors';
import { AppText } from './AppText';

// Botón tipo "pastilla" para filtrar por categoría en Colección.
// Cuando está seleccionado (active) se pinta de negro.
export function FilterChip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <AppText variant="bodySemiBold" style={[styles.label, active && styles.labelActive]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: colors.black,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.text,
  },
  labelActive: {
    color: colors.white,
  },
});
