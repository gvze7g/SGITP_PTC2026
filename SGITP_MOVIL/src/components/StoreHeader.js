import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Building2, Menu, ShoppingBag, ShoppingBasket } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../hooks/useCart';
import { isWholesaleCustomer } from '../utils/purchaseRules';
import { AppText } from './AppText';
import { HamburgerMenu } from './HamburgerMenu';

// Encabezado de las pantallas de la tienda (Inicio, Colección, Favoritos,
// Tiendas, Perfil): menú a la izquierda, marca al centro, carrito a la
// derecha con la cantidad real de artículos (ver useCart.js). Cada pantalla
// lo pone fuera de su ScrollView/FlatList para que quede fijo arriba y no
// haya que regresar al inicio para abrir el menú o el carrito.
export function StoreHeader() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const isWholesale = isWholesaleCustomer(user);
  const CustomerIcon = isWholesale ? Building2 : ShoppingBasket;
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.header}>
      <Pressable hitSlop={12} onPress={() => setMenuVisible(true)}>
        <Menu size={22} color={colors.text} />
      </Pressable>
      <AppText variant="wordmark" style={styles.wordmark}>
        PEQUES
      </AppText>
      <View style={styles.rightGroup}>
        {/* Tipo de cliente: el mayorista ve su precio y el stock; el minorista tiene tope de 4 por producto */}
        {user ? (
          <View style={[styles.customerType, isWholesale && styles.customerTypeWholesale]}>
            <CustomerIcon size={12} color={isWholesale ? colors.error : colors.textMuted} />
            <AppText
              variant="bodyBold"
              style={[styles.customerTypeLabel, isWholesale && styles.customerTypeLabelWholesale]}
            >
              {isWholesale ? 'Mayorista' : 'Minorista'}
            </AppText>
          </View>
        ) : null}
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
      </View>

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
      backgroundColor: colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      zIndex: 10,
    },
    wordmark: {
      fontSize: 16,
      letterSpacing: 4,
    },
    rightGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    customerType: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    customerTypeWholesale: {
      borderColor: colors.error,
    },
    customerTypeLabel: {
      fontSize: 10,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.textMuted,
    },
    customerTypeLabelWholesale: {
      color: colors.error,
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
