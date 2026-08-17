import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../constants/colors';
import { AppText } from './AppText';

// Botón reutilizable con 2 estilos: "primary" (negro, relleno) y "outline"
// (con borde, sin relleno). También sabe mostrar una ruedita de carga y
// aceptar un ícono a la izquierda o a la derecha del texto.
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
}) {
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.primary,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.text : colors.white} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' ? icon : null}
          <AppText
            variant="bodyBold"
            style={[styles.label, isOutline ? styles.outlineLabel : styles.primaryLabel]}
          >
            {label}
          </AppText>
          {icon && iconPosition === 'right' ? icon : null}
        </View>
      )}
    </Pressable>
  );
}


//Estilos del boton
const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.black,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 13,
  },
  primaryLabel: {
    color: colors.white,
  },
  outlineLabel: {
    color: colors.text,
  },
});
