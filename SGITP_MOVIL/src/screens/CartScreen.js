import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ArrowLeft, Minus, Plus, ShoppingBag, X } from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../hooks/useCart';
import { request } from '../services/apiClient';

// Pantalla "Tu Selección": el carrito real del cliente (GET/PUT/DELETE
// /cart/mine, ver useCart.js). El backend no guarda talla/color por línea
// de carrito todavía (solo productId + cantidad), así que a diferencia del
// mockup no se muestra esa línea: solo lo que el dato realmente tiene.
export function CartScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showToast } = useToast();
  const { items, total, isLoading, updateItem, removeItem } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const discountAmount = appliedCoupon
    ? Number((total * (appliedCoupon.discount_percentage / 100)).toFixed(2))
    : 0;
  const totalWithDiscount = Math.max(0, Number(total) - discountAmount);

  async function changeQuantity(productId, nextQuantity) {
    try {
      if (nextQuantity <= 0) {
        await removeItem(productId);
      } else {
        await updateItem(productId, nextQuantity);
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;

    setIsValidatingCoupon(true);
    try {
      const coupon = await request(`/promotions/validate/${encodeURIComponent(code)}`, {
        method: 'GET',
      });
      setAppliedCoupon(coupon);
      showToast(`Cupón "${coupon.coupon_code}" aplicado: -${coupon.discount_percentage}%`, 'success');
    } catch (error) {
      setAppliedCoupon(null);
      showToast(error.message, 'error');
    } finally {
      setIsValidatingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId?._id ?? item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
                <ArrowLeft size={22} color={colors.text} />
              </Pressable>
              <AppText variant="wordmark" style={styles.headerWordmark}>
                PEQUES
              </AppText>
              <View style={styles.headerSpacer} />
            </View>
            <AppText variant="heading" style={styles.title}>
              Tu Selección
            </AppText>
          </>
        }
        renderItem={({ item }) => {
          const product = item.productId ?? {};
          const imageUrl = product.images?.[0]?.image;

          return (
            <View style={styles.itemCard}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.itemImage} contentFit="cover" />
              ) : (
                <View style={[styles.itemImage, styles.itemImagePlaceholder]} />
              )}

              <View style={styles.itemBody}>
                <View style={styles.itemTitleRow}>
                  <AppText variant="bodySemiBold" style={styles.itemName} numberOfLines={2}>
                    {product.name}
                  </AppText>
                  <Pressable onPress={() => changeQuantity(product._id, 0)} hitSlop={8}>
                    <X size={16} color={colors.textMuted} />
                  </Pressable>
                </View>

                <View style={styles.itemFooter}>
                  <View style={styles.stepper}>
                    <Pressable
                      style={styles.stepperButton}
                      onPress={() => changeQuantity(product._id, item.quantity - 1)}
                      hitSlop={8}
                    >
                      <Minus size={14} color={colors.text} />
                    </Pressable>
                    <AppText variant="bodySemiBold" style={styles.stepperValue}>
                      {item.quantity}
                    </AppText>
                    <Pressable
                      style={styles.stepperButton}
                      onPress={() => changeQuantity(product._id, item.quantity + 1)}
                      hitSlop={8}
                    >
                      <Plus size={14} color={colors.text} />
                    </Pressable>
                  </View>

                  <AppText variant="bodySemiBold">${Number(item.subtotal ?? 0).toFixed(2)} USD</AppText>
                </View>
              </View>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.text} style={styles.loading} />
          ) : (
            <View style={styles.emptyState}>
              <ShoppingBag size={32} color={colors.textMuted} />
              <AppText variant="muted" style={styles.emptyText}>
                Tu carrito está vacío.
              </AppText>
            </View>
          )
        }
        ListFooterComponent={
          items.length > 0 ? (
            <>
              <Pressable
                style={styles.continueLink}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Colección' })}
              >
                <ArrowLeft size={14} color={colors.text} />
                <AppText variant="bodySemiBold" style={styles.continueLabel}>
                  Continuar Explorando
                </AppText>
              </Pressable>

              <View style={styles.summaryCard}>
                <AppText variant="headingSemiBold">Resumen</AppText>

                <View style={styles.couponRow}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Código de descuento"
                    placeholderTextColor={colors.textMuted}
                    value={couponInput}
                    onChangeText={(value) => setCouponInput(value.toUpperCase())}
                    maxLength={20}
                    autoCapitalize="characters"
                    editable={!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <Pressable style={styles.couponButton} onPress={handleRemoveCoupon} hitSlop={8}>
                      <AppText variant="bodySemiBold" style={styles.couponButtonLabel}>
                        Quitar
                      </AppText>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={styles.couponButton}
                      onPress={handleApplyCoupon}
                      disabled={isValidatingCoupon}
                      hitSlop={8}
                    >
                      <AppText variant="bodySemiBold" style={styles.couponButtonLabel}>
                        {isValidatingCoupon ? '...' : 'Aplicar'}
                      </AppText>
                    </Pressable>
                  )}
                </View>

                <View style={styles.summaryRow}>
                  <AppText variant="muted">Subtotal</AppText>
                  <AppText variant="bodySemiBold">${Number(total).toFixed(2)} USD</AppText>
                </View>
                {appliedCoupon ? (
                  <View style={styles.summaryRow}>
                    <AppText variant="muted">Descuento ({appliedCoupon.coupon_code})</AppText>
                    <AppText variant="bodySemiBold">-${discountAmount.toFixed(2)} USD</AppText>
                  </View>
                ) : null}
                <AppText variant="muted" style={styles.summaryNote}>
                  El envío se calcula en el siguiente paso.
                </AppText>

                <View style={styles.summaryTotalRow}>
                  <AppText variant="headingSemiBold">Total</AppText>
                  <AppText variant="headingSemiBold">${totalWithDiscount.toFixed(2)} USD</AppText>
                </View>

                <Button
                  label="Proceder al Pago"
                  onPress={() =>
                    navigation.navigate('Checkout', { couponCode: appliedCoupon?.coupon_code })
                  }
                />
              </View>
            </>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      flexGrow: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    title: {
      marginTop: 16,
      marginBottom: 20,
    },
    itemCard: {
      flexDirection: 'row',
      gap: 14,
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 14,
    },
    itemImage: {
      width: 84,
      height: 84,
      borderRadius: 12,
    },
    itemImagePlaceholder: {
      backgroundColor: colors.border,
    },
    itemBody: {
      flex: 1,
      justifyContent: 'space-between',
    },
    itemTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    itemName: {
      flex: 1,
    },
    itemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    stepperButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperValue: {
      minWidth: 16,
      textAlign: 'center',
    },
    separator: {
      height: 16,
    },
    loading: {
      marginTop: 40,
    },
    emptyState: {
      alignItems: 'center',
      marginTop: 60,
      gap: 12,
    },
    emptyText: {
      textAlign: 'center',
    },
    continueLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 24,
      alignSelf: 'flex-start',
    },
    continueLabel: {
      fontSize: 13,
    },
    summaryCard: {
      marginTop: 32,
      backgroundColor: colors.cardTan,
      borderRadius: 20,
      padding: 22,
      gap: 14,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    couponRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    couponInput: {
      flex: 1,
      height: 42,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: 10,
      paddingHorizontal: 12,
      color: colors.text,
    },
    couponButton: {
      height: 42,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.text,
    },
    couponButtonLabel: {
      color: colors.background,
      fontSize: 13,
    },
    summaryNote: {
      marginTop: -8,
    },
    summaryTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.borderStrong,
    },
  });
}
