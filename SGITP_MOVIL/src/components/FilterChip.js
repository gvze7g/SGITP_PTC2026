import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { AppText } from './AppText';

// Botón tipo "pastilla" para filtrar por categoría en Colección (y para
// elegir ciudad en Direcciones Guardadas). Cuando está seleccionado
// (active) se pinta con el tono de más contraste del tema.
export function FilterChip({ label, active, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <AppText variant="bodySemiBold" style={[styles.label, active && styles.labelActive]}>
        {label}
      </AppText>
    </Pressable>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
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
}
