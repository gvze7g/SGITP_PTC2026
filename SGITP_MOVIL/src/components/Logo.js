import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

// Muestra el logo de la marca (la abeja). "size" controla el ancho y alto.
export function Logo({ size = 140 }) {
  return (
    <Image
      source={require('../../assets/logo.png')}
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
