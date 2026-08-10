import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { Heart } from 'lucide-react-native';

import { colors } from '../constants/colors';
import { useFavorites } from '../context/FavoritesContext';
import { AppText } from './AppText';

// Tarjeta de producto: foto + corazón de favorito + nombre + precio.
// Se usa tanto en la grilla de Colección como en la fila horizontal de Inicio.
export function ProductCard({ product, onPress, style }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product._id);
  const imageUrl = product.images?.[0]?.image;

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
      <AppText variant="muted" style={styles.price}>
        ${Number(product.price ?? 0).toFixed(2)} USD
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  name: {
    marginBottom: 2,
  },
  price: {
    fontSize: 13,
  },
});
