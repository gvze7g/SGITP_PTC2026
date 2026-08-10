import { Pressable, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { colors } from '../constants/colors';
import { AppText } from './AppText';

// Casilla de verificación (ej. "Recordarme" en Login). "checked" dice si
// está marcada y "onToggle" es lo que se ejecuta al tocarla.
export function Checkbox({ label, checked, onToggle }) {
  return (
    <Pressable style={styles.row} onPress={onToggle} hitSlop={8}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Check size={13} color={colors.white} strokeWidth={3} /> : null}
      </View>
      <AppText variant="bodyRegular" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  boxChecked: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  label: {
    fontSize: 14,
  },
});
