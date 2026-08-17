import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { AppText } from './AppText';

// Pie de página con el lema de la marca, usado al final de algunas pantallas.
export function BrandFooter() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <AppText variant="label" style={styles.tagline}>
        Minimal Luxury Nursery
      </AppText>
      <AppText variant="muted" style={styles.copyright}>
        © 2024 PEQUES
      </AppText>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      marginTop: 32,
    },
    line: {
      width: '100%',
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 16,
    },
    tagline: {
      marginBottom: 4,
    },
    copyright: {
      fontSize: 12,
    },
  });
}
