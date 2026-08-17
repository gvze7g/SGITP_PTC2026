import { memo, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, Heart } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Accordion } from '../components/Accordion';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../hooks/useCart';
import { useProduct } from '../hooks/useProduct';
import { useProducts } from '../hooks/useProducts';
import { getActiveOffer, getDiscountedPrice } from '../utils/offers';

// Aislado con memo() para que un tap en UNA miniatura no vuelva a renderizar
// a las demás: si no, cada tap cambia activeImageIndex, re-renderiza toda
// la pantalla, y eso recrea el objeto `source` de TODAS las miniaturas
// (aunque su uri no cambió) — expo-image lo toma como "imagen nueva" y
// reinicia la transición, haciendo que parpadeen/desaparezcan un instante.
const Thumbnail = memo(function Thumbnail({ uri, isActive, index, onSelect, styles }) {
  return (
    <Pressable onPress={() => onSelect(index)}>
      <Image
        source={{ uri }}
        style={[styles.thumbnail, isActive && styles.thumbnailActive]}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
      />
    </Pressable>
  );
});

// Pantalla de detalle de un producto: fotos, variantes (color/talla),
// botón de agregar al carrito y productos relacionados.
export function ProductDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { productId } = route.params;
  const { data: product, isLoading } = useProduct(productId);
  const { data: allProducts } = useProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // Medimos el ancho real de la pantalla para decirle a la imagen principal
  // qué alto tener (ver el mismo truco explicado en ProductCard.js).
  const [imageWidth, setImageWidth] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const handleSelectImage = useCallback((index) => setActiveImageIndex(index), []);

  const colorsAvailable = useMemo(() => {
    const seen = new Map();
    (product?.variants ?? []).forEach((variant) => {
      if (variant.color && !seen.has(variant.color)) {
        seen.set(variant.color, variant.colorHex || null);
      }
    });
    return [...seen.entries()].map(([name, hex]) => ({ name, hex }));
  }, [product]);
  const sizesAvailable = useMemo(
    () => [...new Set((product?.variants ?? []).map((variant) => variant.size).filter(Boolean))],
    [product]
  );

  const relatedProducts = useMemo(() => {
    if (!allProducts || !product) return [];
    return allProducts
      .filter((item) => item._id !== product._id && item.category === product.category)
      .slice(0, 4);
  }, [allProducts, product]);

  if (isLoading || !product) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={colors.text} />
      </SafeAreaView>
    );
  }

  const images = product.images ?? [];
  const favorite = isFavorite(product._id);
  const offer = getActiveOffer(product);

  // Busca si existe stock para la combinación de color y talla elegidas.
  function isSizeDisabled(size) {
    if (!selectedColor) return false;
    const variant = product.variants?.find((v) => v.color === selectedColor && v.size === size);
    return variant ? Number(variant.stock) <= 0 : false;
  }

  async function handleAddToCart() {
    // El carrito del backend todavía no guarda color/talla por línea (solo
    // productId + cantidad, ver shopping_cartController.js), así que la
    // selección de arriba es solo para elegir stock visualmente.
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <AppText variant="wordmark" style={styles.headerWordmark}>
          PEQUES
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.breadcrumb}>
          <AppText variant="muted" style={styles.breadcrumbText}>
            Colección › {product.category ?? 'Producto'} › {product.name}
          </AppText>
        </View>

        <View onLayout={(e) => setImageWidth(e.nativeEvent.layout.width)}>
          {imageWidth > 0 && images[activeImageIndex]?.image ? (
            <Image
              source={{ uri: images[activeImageIndex].image }}
              style={{ width: imageWidth, height: imageWidth, backgroundColor: colors.surface }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
            />
          ) : (
            <View style={[styles.imagePlaceholder, { width: imageWidth, height: imageWidth }]} />
          )}
        </View>

        {images.length > 1 ? (
          <View style={styles.thumbnailRow}>
            {images.map((image, index) => (
              <Thumbnail
                key={image.public_id ?? index}
                uri={image.image}
                isActive={index === activeImageIndex}
                index={index}
                onSelect={handleSelectImage}
                styles={styles}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <AppText variant="headingMedium" style={styles.title}>
              {product.name}
            </AppText>
            <Pressable onPress={() => toggleFavorite(product._id)} hitSlop={8}>
              <Heart
                size={22}
                color={favorite ? colors.error : colors.text}
                fill={favorite ? colors.error : 'transparent'}
              />
            </Pressable>
          </View>

          {offer ? (
            <View style={styles.priceRow}>
              <AppText variant="headingSemiBold" style={styles.offerPrice}>
                ${getDiscountedPrice(product, offer).toFixed(2)} USD
              </AppText>
              <AppText variant="muted" style={styles.oldPrice}>
                ${Number(product.price ?? 0).toFixed(2)}
              </AppText>
              <View style={styles.offerBadge}>
                <AppText variant="bodyBold" style={styles.offerBadgeLabel}>
                  -{offer.value}%
                </AppText>
              </View>
            </View>
          ) : (
            <AppText variant="headingSemiBold" style={styles.price}>
              ${Number(product.price ?? 0).toFixed(2)} USD
            </AppText>
          )}

          {product.description ? (
            <AppText variant="bodyRegular" style={styles.description}>
              {product.description}
            </AppText>
          ) : null}

          {colorsAvailable.length > 0 ? (
            <View style={styles.variantSection}>
              <AppText variant="label">Color{selectedColor ? `: ${selectedColor}` : ''}</AppText>
              <View style={styles.colorRow}>
                {colorsAvailable.map((color) => (
                  <Pressable
                    key={color.name}
                    onPress={() => setSelectedColor(color.name)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color.hex || color.name },
                      selectedColor === color.name && styles.colorSwatchActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {sizesAvailable.length > 0 ? (
            <View style={styles.variantSection}>
              <View style={styles.sizeHeader}>
                <AppText variant="label">Talla</AppText>
                <AppText variant="link" style={styles.sizeGuide}>
                  Guía de tallas
                </AppText>
              </View>
              <View style={styles.sizeRow}>
                {sizesAvailable.map((size) => {
                  const disabled = isSizeDisabled(size);
                  return (
                    <Pressable
                      key={size}
                      disabled={disabled}
                      onPress={() => setSelectedSize(size)}
                      style={[
                        styles.sizePill,
                        selectedSize === size && styles.sizePillActive,
                        disabled && styles.sizePillDisabled,
                      ]}
                    >
                      <AppText
                        variant="bodySemiBold"
                        style={[
                          styles.sizeLabel,
                          selectedSize === size && styles.sizeLabelActive,
                          disabled && styles.sizeLabelDisabled,
                        ]}
                      >
                        {size}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.addToCartWrapper}>
            <Button label="Agregar al carrito" loading={isAddingToCart} onPress={handleAddToCart} />
          </View>

          <Accordion title="Materiales & Cuidado">
            <AppText variant="bodyRegular" style={styles.accordionText}>
              Lavar a mano o en ciclo suave con agua fría. No usar blanqueador. Secar a la sombra
              para conservar el color y la suavidad de la tela.
            </AppText>
          </Accordion>
          <Accordion title="Envíos & Devoluciones">
            <AppText variant="bodyRegular" style={styles.accordionText}>
              Envíos en 3-5 días hábiles. Puedes devolver el producto dentro de los primeros 30
              días si no ha sido usado.
            </AppText>
          </Accordion>

          {relatedProducts.length > 0 ? (
            <View style={styles.relatedSection}>
              <AppText variant="headingSemiBold">Completa el look</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {relatedProducts.map((related) => (
                  <ProductCard
                    key={related._id}
                    product={related}
                    style={styles.relatedCard}
                    onPress={() =>
                      navigation.push('ProductDetail', { productId: related._id })
                    }
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 8,
    },
    headerWordmark: {
      fontSize: 16,
      letterSpacing: 4,
    },
    headerSpacer: {
      width: 22,
    },
    breadcrumb: {
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    breadcrumbText: {
      fontSize: 12,
    },
    imagePlaceholder: {
      backgroundColor: colors.surface,
    },
    thumbnailRow: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      marginTop: 10,
    },
    thumbnail: {
      width: 64,
      height: 64,
      borderRadius: 10,
      opacity: 0.6,
      backgroundColor: colors.surface,
    },
    thumbnailActive: {
      opacity: 1,
      borderWidth: 2,
      borderColor: colors.black,
    },
    content: {
      padding: 20,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    title: {
      flex: 1,
    },
    price: {
      marginTop: 8,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 8,
    },
    offerPrice: {
      color: colors.error,
    },
    oldPrice: {
      textDecorationLine: 'line-through',
    },
    offerBadge: {
      backgroundColor: colors.error,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    offerBadgeLabel: {
      color: colors.white,
      fontSize: 11,
    },
    description: {
      marginTop: 16,
      lineHeight: 22,
    },
    variantSection: {
      marginTop: 24,
    },
    colorRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    colorSwatch: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    colorSwatchActive: {
      borderWidth: 2,
      borderColor: colors.black,
    },
    sizeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    sizeGuide: {
      textDecorationLine: 'underline',
    },
    sizeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 12,
    },
    sizePill: {
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    sizePillActive: {
      backgroundColor: colors.cardTan,
      borderColor: colors.black,
    },
    sizePillDisabled: {
      opacity: 0.35,
    },
    sizeLabel: {
      fontSize: 13,
    },
    sizeLabelActive: {
      color: colors.text,
    },
    sizeLabelDisabled: {
      color: colors.textMuted,
    },
    addToCartWrapper: {
      marginTop: 28,
      marginBottom: 8,
    },
    accordionText: {
      lineHeight: 20,
    },
    relatedSection: {
      marginTop: 28,
    },
    relatedCard: {
      width: 150,
      marginRight: 16,
      marginTop: 16,
    },
  });
}
