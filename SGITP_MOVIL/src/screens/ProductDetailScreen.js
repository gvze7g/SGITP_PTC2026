import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, Heart, Minus, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Accordion } from '../components/Accordion';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../hooks/useCart';
import { useProduct } from '../hooks/useProduct';
import { useProducts } from '../hooks/useProducts';
import { getActiveOffer, getDiscountedPrice, getWholesalePrice } from '../utils/offers';
import {
  RETAIL_LIMIT_MESSAGE,
  RETAIL_MAX_UNITS_PER_PRODUCT,
  findVariant,
  getVariantStock,
  isWholesaleCustomer,
} from '../utils/purchaseRules';

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
  const { user } = useAuth();
  const isWholesale = isWholesaleCustomer(user);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // Medimos el ancho real de la pantalla para decirle a la imagen principal
  // qué alto tener (ver el mismo truco explicado en ProductCard.js).
  const [imageWidth, setImageWidth] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Al abrir un producto se preselecciona la primera variante con stock,
  // para que "Agregar al carrito" siempre sepa qué talla/color llevar.
  useEffect(() => {
    const variants = product?.variants ?? [];
    const firstAvailable = variants.find((variant) => getVariantStock(variant) > 0) ?? variants[0];
    setSelectedColor(firstAvailable?.color || null);
    setSelectedSize(firstAvailable?.size || null);
    setQuantity(1);
  }, [product?._id, product?.variants]);

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
  const wholesalePrice = getWholesalePrice(product);
  const offer = wholesalePrice ? null : getActiveOffer(product);
  const selectedVariant = findVariant(product, selectedSize, selectedColor);
  const selectedStock = getVariantStock(selectedVariant);
  // Solo el mayorista ve cuántas unidades hay; el minorista solo si hay o no.
  let stockLabel = 'Agotado';
  if (selectedStock > 0) stockLabel = isWholesale ? `${selectedStock} unidades en stock` : 'Disponible';

  function handleSelectColor(color) {
    setSelectedColor(color);
    setQuantity(1);
    if (!findVariant(product, selectedSize, color)) {
      const fallback = product.variants?.find((variant) => variant.color === color);
      setSelectedSize(fallback?.size || null);
    }
  }

  function handleSelectSize(size) {
    setSelectedSize(size);
    setQuantity(1);
  }

  // El minorista tiene un tope por producto y nadie puede pedir más de lo
  // que hay en la talla/color elegida.
  function getQuantityError(nextQuantity) {
    if (!isWholesale && nextQuantity > RETAIL_MAX_UNITS_PER_PRODUCT) return RETAIL_LIMIT_MESSAGE;
    if (nextQuantity > selectedStock) {
      return isWholesale
        ? `Solo hay ${selectedStock} unidades disponibles de esta talla y color`
        : 'No hay más unidades disponibles de esta talla y color';
    }
    return null;
  }

  function handleChangeQuantity(nextQuantity) {
    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) return;
    const error = getQuantityError(nextQuantity);
    if (error) {
      showToast(error, 'error');
      return;
    }
    setQuantity(nextQuantity);
  }

  // Busca si existe stock para la combinación de color y talla elegidas.
  function isSizeDisabled(size) {
    if (!selectedColor) return false;
    const variant = product.variants?.find((v) => v.color === selectedColor && v.size === size);
    // Una talla que no existe en el color elegido tampoco se puede escoger.
    return variant ? getVariantStock(variant) <= 0 : true;
  }

  async function handleAddToCart() {
    if (!user) {
      showToast('Inicia sesión para agregar productos al carrito', 'error');
      return;
    }
    if (!selectedVariant) {
      showToast('Selecciona una talla y un color', 'error');
      return;
    }
    if (selectedStock <= 0) {
      showToast('Esa combinación de talla y color está agotada', 'error');
      return;
    }
    const error = getQuantityError(quantity);
    if (error) {
      showToast(error, 'error');
      return;
    }

    setIsAddingToCart(true);
    try {
      // El backend vuelve a validar stock y límite sumando lo que ya hay en
      // el carrito, y responde con el mensaje exacto si no alcanza.
      await addItem(product._id, quantity, {
        size: selectedVariant.size,
        color: selectedVariant.color,
      });
      showToast(
        quantity === 1 ? 'Producto agregado al carrito' : `${quantity} unidades agregadas al carrito`,
        'success'
      );
      setQuantity(1);
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
              ${Number(wholesalePrice ?? product.price ?? 0).toFixed(2)} USD
            </AppText>
          )}
          {wholesalePrice ? (
            <AppText variant="label" style={styles.priceNote}>
              Precio mayorista
            </AppText>
          ) : null}

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
                    onPress={() => handleSelectColor(color.name)}
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
                      onPress={() => handleSelectSize(size)}
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

          <AppText
            variant="bodySemiBold"
            style={[styles.stockLabel, selectedStock <= 0 && styles.stockLabelOut]}
          >
            {stockLabel}
          </AppText>

          {selectedStock > 0 ? (
            <View style={styles.quantityRow}>
              <AppText variant="label">Cantidad</AppText>
              <View style={styles.stepper}>
                <Pressable
                  style={[styles.stepperButton, quantity <= 1 && styles.stepperButtonDisabled]}
                  onPress={() => handleChangeQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  hitSlop={8}
                >
                  <Minus size={14} color={colors.text} />
                </Pressable>
                <AppText variant="bodySemiBold" style={styles.stepperValue}>
                  {quantity}
                </AppText>
                {/* No se deshabilita en el máximo: el toque muestra la alerta del límite */}
                <Pressable
                  style={styles.stepperButton}
                  onPress={() => handleChangeQuantity(quantity + 1)}
                  hitSlop={8}
                >
                  <Plus size={14} color={colors.text} />
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={styles.addToCartWrapper}>
            <Button
              label={selectedStock > 0 ? 'Agregar al carrito' : 'Agotado'}
              loading={isAddingToCart}
              disabled={selectedStock <= 0}
              onPress={handleAddToCart}
            />
          </View>

          <Accordion title="Materiales y cuidado">
            <AppText variant="bodyRegular" style={styles.accordionText}>
              Lavar a mano o en ciclo suave con agua fría. No usar blanqueador. Secar a la sombra
              para conservar el color y la suavidad de la tela.
            </AppText>
          </Accordion>
          <Accordion title="Envíos y devoluciones">
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
    priceNote: {
      marginTop: 4,
    },
    stockLabel: {
      marginTop: 20,
      fontSize: 13,
    },
    stockLabelOut: {
      color: colors.error,
    },
    quantityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    stepperButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperButtonDisabled: {
      opacity: 0.35,
    },
    stepperValue: {
      minWidth: 20,
      textAlign: 'center',
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
