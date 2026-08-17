import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { AppText } from './AppText';

// Encabezado repetido en varias pantallas: flecha para volver atrás + el
// nombre de la marca "PEQUES" centrado. El espacio vacío de la derecha
// (headerSpacer) existe solo para que el texto quede realmente centrado.
export function ScreenHeader({ onBack }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12}>
        <ArrowLeft size={22} color={colors.text} />
      </Pressable>
      <AppText variant="wordmark" style={styles.wordmark}>
        PEQUES
      </AppText>
      <View style={styles.spacer} />
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    wordmark: {
      fontSize: 16,
      letterSpacing: 4,
    },
    spacer: {
      width: 22,
    },
  });
}
