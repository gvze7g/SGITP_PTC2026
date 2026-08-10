import { Pressable, StyleSheet, View } from 'react-native';
import { Menu, ShoppingBag } from 'lucide-react-native';

import { colors } from '../constants/colors';
import { AppText } from './AppText';

// Encabezado de las pantallas de la tienda (Inicio y Colección): menú a la
// izquierda, marca al centro, carrito a la derecha. El menú y el carrito
// todavía no abren nada (no existe esa pantalla en la app todavía).
export function StoreHeader() {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={12}>
        <Menu size={22} color={colors.text} />
      </Pressable>
      <AppText variant="wordmark" style={styles.wordmark}>
        PEQUES
      </AppText>
      <Pressable hitSlop={12}>
        <ShoppingBag size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  wordmark: {
    fontSize: 16,
    letterSpacing: 4,
  },
});
