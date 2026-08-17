import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { AppText } from './AppText';

// Línea divisoria con una palabra en medio, ej: "──── o ────" (se usa en Login).
export function Divider({ label }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <AppText variant="muted" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.line} />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    label: {
      marginHorizontal: 12,
    },
  });
}
