import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Menu, ShoppingBag } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../hooks/useCart';
import { AppText } from './AppText';
import { HamburgerMenu } from './HamburgerMenu';

// Encabezado de las pantallas de la tienda (Inicio, Colección, Favoritos,
// Tiendas, Perfil): menú a la izquierda, marca al centro, carrito a la
// derecha con la cantidad real de artículos (ver useCart.js).
export function StoreHeader() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation();
  const { itemCount } = useCart();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.header}>
      <Pressable hitSlop={12} onPress={() => setMenuVisible(true)}>
        <Menu size={22} color={colors.text} />
      </Pressable>
      <AppText variant="wordmark" style={styles.wordmark}>
        PEQUES
      </AppText>
      <Pressable hitSlop={12} onPress={() => navigation.navigate('Cart')} style={styles.cartIcon}>
        <ShoppingBag size={22} color={colors.text} />
        {itemCount > 0 ? (
          <View style={styles.badge}>
            <AppText variant="bodyBold" style={styles.badgeLabel}>
              {itemCount > 9 ? '9+' : itemCount}
            </AppText>
          </View>
        ) : null}
      </Pressable>

      <HamburgerMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
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
    cartIcon: {
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -8,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      paddingHorizontal: 3,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeLabel: {
      color: colors.white,
      fontSize: 9,
    },
  });
}
