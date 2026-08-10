import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../constants/colors';

// Envoltorio para pantallas con formularios.
// Se encarga de que el teclado NUNCA tape los inputs: en iOS empuja el
// contenido hacia arriba (padding) y en Android achica la pantalla (height).
// Así este arreglo queda hecho una sola vez y no hay que repetirlo en cada pantalla nueva.
export function KeyboardAvoidingScreen({ header, children, contentStyle }) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {header}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
});
