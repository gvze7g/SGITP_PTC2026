import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { fontFamily } from '../constants/typography';
import { AppText } from './AppText';

// Input de texto reutilizable. Dos estilos disponibles con "variant":
// "filled" = caja rellena (se usa en Login) y "underline" = solo una línea
// abajo con una etiqueta arriba (se usa en Registro y Recuperar Contraseña).
// Si se le pasa secureField=true, agrega el ojito para mostrar/ocultar la contraseña.
// "filter" (ver utils/inputFilters.js) limpia lo que no corresponde a ese
// campo apenas se escribe (ej. que un teléfono no acepte letras).
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
  multiline = false,
  filter,
  maxLength,
  editable = true,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const isFilled = variant === 'filled';
  const isPasswordHidden = secureField && !isSecureVisible;

  function handleChangeText(text) {
    onChangeText(filter ? filter(text) : text);
  }

  return (
    <View style={styles.container}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.fieldRow,
          isFilled ? styles.filledField : styles.underlineField,
          !editable && styles.disabledField,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={isPasswordHidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          maxLength={maxLength}
          editable={editable}
          style={[styles.input, multiline && styles.inputMultiline]}
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

function createStyles(colors) {
  return StyleSheet.create({
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
    disabledField: {
      opacity: 0.6,
    },
    input: {
      flex: 1,
      height: 50,
      fontFamily: fontFamily.bodyRegular,
      fontSize: 15,
      color: colors.text,
    },
    inputMultiline: {
      height: 90,
      textAlignVertical: 'top',
      paddingTop: 12,
    },
    error: {
      color: colors.error,
      marginTop: 6,
    },
  });
}
