import { StyleSheet, View } from 'react-native';

import { colors } from '../constants/colors';
import { AppText } from './AppText';

// Línea divisoria con una palabra en medio, ej: "──── o ────" (se usa en Login).
export function Divider({ label }) {
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

const styles = StyleSheet.create({
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
