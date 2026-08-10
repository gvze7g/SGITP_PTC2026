import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

import { colors } from '../constants/colors';
import { fontFamily } from '../constants/typography';
import { AppText } from './AppText';

// Input de texto reutilizable. Dos estilos disponibles con "variant":
// "filled" = caja rellena (se usa en Login) y "underline" = solo una línea
// abajo con una etiqueta arriba (se usa en Registro y Recuperar Contraseña).
// Si se le pasa secureField=true, agrega el ojito para mostrar/ocultar la contraseña.
export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  secureField = false,
  error,
  variant = 'filled',
  keyboardType = 'default',
  autoCapitalize = 'none',
}) {
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const isFilled = variant === 'filled';
  const isPasswordHidden = secureField && !isSecureVisible;

  return (
    <View style={styles.container}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View style={[styles.fieldRow, isFilled ? styles.filledField : styles.underlineField]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={isPasswordHidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={styles.input}
        />
        {secureField ? (
          <Pressable onPress={() => setIsSecureVisible((prev) => !prev)} hitSlop={10}>
            {isSecureVisible ? (
              <EyeOff size={18} color={colors.textMuted} />
            ) : (
              <Eye size={18} color={colors.textMuted} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="muted" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
  },
  filledField: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  underlineField: {
    backgroundColor: 'transparent',
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    color: colors.error,
    marginTop: 6,
  },
});
