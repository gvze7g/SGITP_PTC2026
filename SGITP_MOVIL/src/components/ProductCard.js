import { useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { Heart } from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { getActiveOffer, getDiscountedPrice } from '../utils/offers';
import { AppText } from './AppText';

// Tarjeta de producto: foto + corazón de favorito + nombre + precio.
// Se usa tanto en la grilla de Colección como en la fila horizontal de Inicio.
export function ProductCard({ product, onPress, style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product._id);
  const imageUrl = product.images?.[0]?.image;
  const offer = getActiveOffer(product);

  // Medimos el ancho real de la tarjeta (puede variar: en la grilla ocupa la
  // mitad de la pantalla, en las filas horizontales tiene un ancho fijo) y
  // usamos ese mismo número como alto, para que la imagen quede cuadrada.
  const [imageSize, setImageSize] = useState(0);

  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
      <View style={styles.imageWrapper} onLayout={(e) => setImageSize(e.nativeEvent.layout.width)}>
        {imageSize > 0 && imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: imageSize, height: imageSize, borderRadius: 14 }}
            contentFit="cover"
          />
        ) : (
          // Si todavía no sabemos el tamaño o el producto no tiene foto, mostramos un cuadro vacío.
          <View
            style={[
              styles.imagePlaceholder,
              { width: imageSize || undefined, height: imageSize },
            ]}
          />
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
          <Heart
            size={16}
            color={favorite ? colors.error : colors.text}
            fill={favorite ? colors.error : 'transparent'}
          />
        </Pressable>
      </View>
      <AppText variant="bodyMedium" numberOfLines={2} style={styles.name}>
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
    </Pressable>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      width: 165,
    },
    imageWrapper: {
      position: 'relative',
      marginBottom: 10,
    },
    imagePlaceholder: {
      borderRadius: 14,
      backgroundColor: colors.surface,
    },
    favoriteButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    offerBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: colors.error,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    offerBadgeLabel: {
      color: colors.white,
      fontSize: 11,
    },
    name: {
      marginBottom: 2,
    },
    price: {
      fontSize: 13,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    offerPrice: {
      fontSize: 13,
      color: colors.error,
    },
    oldPrice: {
      fontSize: 12,
      textDecorationLine: 'line-through',
    },
  });
}
