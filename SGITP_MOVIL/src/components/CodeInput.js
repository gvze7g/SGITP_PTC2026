import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors } from '../constants/colors';
import { fontFamily } from '../constants/typography';

// Cajitas para escribir el código de verificación (uno por letra/número).
// El código del backend puede traer letras (a-f) y números, por eso se
// aceptan ambos y se guardan siempre en minúscula.
export function CodeInput({ length = 6, value, onChangeText }) {
  const inputRefs = useRef([]); // para poder mover el cursor a la siguiente/anterior cajita
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  // Al escribir un caracter válido, lo guarda y salta a la siguiente cajita.
  function handleChangeDigit(digit, index) {
    const clean = digit.replace(/[^0-9a-fA-F]/g, '').slice(-1).toLowerCase();
    const nextValue = value.slice(0, index) + clean + value.slice(index + 1);
    onChangeText(nextValue.slice(0, length));

    if (clean && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  // Si borran una cajita vacía, regresa el cursor a la anterior.
  function handleKeyPress(event, index) {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          value={digit}
          onChangeText={(text) => handleChangeDigit(text, index)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={1}
          style={styles.box}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: 46,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.otpBox,
    textAlign: 'center',
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 20,
    color: colors.text,
  },
});
