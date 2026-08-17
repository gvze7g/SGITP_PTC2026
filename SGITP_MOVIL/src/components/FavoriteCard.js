import { useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { Heart, ShoppingBag } from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { getActiveOffer, getDiscountedPrice } from '../utils/offers';
import { AppText } from './AppText';
import { Button } from './Button';

// Tarjeta grande de producto para la pantalla de Favoritos: foto ancha,
// categoría, nombre, precio y botón de agregar al carrito. Es distinta de
// ProductCard (que es chica, para grillas de 2 columnas) porque el diseño
// de Favoritos pide una sola columna con tarjetas más grandes.
export function FavoriteCard({ product, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const imageUrl = product.images?.[0]?.image;
  const offer = getActiveOffer(product);

  async function handleAddToCart() {
    setIsAddingToCart(true);
    try {
      await addItem(product._id, 1);
      showToast('Producto agregado al carrito', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.imageWrapper}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        {offer ? (
          <View style={styles.offerBadge}>
            <AppText variant="bodyBold" style={styles.offerBadgeLabel}>
              -{offer.value}%
            </AppText>
          </View>
        ) : null}
        <Pressable
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(product._id)}
          hitSlop={8}
        >
          <Heart size={18} color={colors.error} fill={colors.error} />
        </Pressable>
      </View>

      <View style={styles.body}>
        {product.category ? (
          <AppText variant="label" style={styles.category}>
            {product.category}
          </AppText>
        ) : null}
        <AppText variant="bodySemiBold" style={styles.name}>
          {product.name}
        </AppText>

        {offer ? (
          <View style={styles.priceRow}>
            <AppText variant="bodySemiBold" style={styles.offerPrice}>
              ${getDiscountedPrice(product, offer).toFixed(2)} USD
            </AppText>
            <AppText variant="muted" style={styles.oldPrice}>
              ${Number(product.price ?? 0).toFixed(2)}
            </AppText>
          </View>
        ) : (
          <AppText variant="muted" style={styles.price}>
            ${Number(product.price ?? 0).toFixed(2)} USD
          </AppText>
        )}

        <View style={styles.addToCartWrapper}>
          <Button
            label="Añadir al carrito"
            icon={<ShoppingBag size={16} color={colors.white} />}
            loading={isAddingToCart}
            onPress={handleAddToCart}
          />
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      overflow: 'hidden',
    },
    imageWrapper: {
      position: 'relative',
    },
    image: {
      width: '100%',
      aspectRatio: 1,
    },
    imagePlaceholder: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: colors.border,
    },
    offerBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      backgroundColor: colors.error,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    offerBadgeLabel: {
      color: colors.white,
      fontSize: 11,
    },
    favoriteButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      padding: 16,
    },
    category: {
      marginBottom: 4,
    },
    name: {
      fontSize: 16,
    },
    price: {
      marginTop: 6,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 6,
    },
    offerPrice: {
      color: colors.error,
    },
    oldPrice: {
      textDecorationLine: 'line-through',
    },
    addToCartWrapper: {
      marginTop: 16,
    },
  });
}
