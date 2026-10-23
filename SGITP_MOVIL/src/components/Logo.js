import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { useTheme } from '../context/ThemeContext';

const LOGO_LIGHT = require('../../assets/logo.png');
const LOGO_DARK = require('../../assets/logo-dark.png');

// Muestra el logo de la marca (la abeja). "size" controla el ancho y alto.
// En modo oscuro se usa la versión con letras blancas.
export function Logo({ size = 140 }) {
  const { theme } = useTheme();

  return (
    <Image
      source={theme === 'dark' ? LOGO_DARK : LOGO_LIGHT}
      style={[styles.image, { width: size, height: size }]}
      contentFit="contain"
      transition={150}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
