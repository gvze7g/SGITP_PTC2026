import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, Lock, MapPin } from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAddresses } from '../hooks/useAddresses';
import { useCart } from '../hooks/useCart';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { digitsOnly } from '../utils/inputFilters';
import { request } from '../services/apiClient';

// Envío fijo (el backend no tiene tarifas de envío configurables todavía).
const SHIPPING_METHODS = [
  { key: 'Standard', label: 'Envío Estándar', description: '3-5 días laborables', cost: 0 },
  { key: 'Express', label: 'Envío Exprés', description: '24-48 horas laborables', cost: 5.9 },
];

// Pantalla de checkout: junta dirección real + tarjeta guardada real y
// arma un pedido REAL contra POST /cart/mine/checkout (crea un documento en
// "sales"), pero no cobra nada de verdad — payment_status queda marcado
// como simulado a propósito, porque este proyecto no integra un
// procesador de pagos.
export function CheckoutScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showToast } = useToast();
  const { user } = useAuth();
  const { items, total, checkout } = useCart();
  const { addresses, isLoading: addressesLoading } = useAddresses();
  const { cards, isLoading: cardsLoading } = usePaymentMethods();
  const couponCodeFromCart = route?.params?.couponCode;

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [phone, setPhone] = useState(user?.main_phone ?? '');
  const [shippingKey, setShippingKey] = useState(SHIPPING_METHODS[0].key);
  const [paymentSelection, setPaymentSelection] = useState(null); // { type: 'card', id } | { type: 'applePay' }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    if (!couponCodeFromCart) return;

    let isCancelled = false;
    request(`/promotions/validate/${encodeURIComponent(couponCodeFromCart)}`, { method: 'GET' })
      .then((coupon) => {
        if (!isCancelled) setAppliedCoupon(coupon);
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [couponCodeFromCart]);

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      setSelectedAddressId((addresses.find((address) => address.isPrimary) ?? addresses[0])._id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (!paymentSelection && cards.length > 0) {
      const primaryCard = cards.find((card) => card.isPrimary) ?? cards[0];
      setPaymentSelection({ type: 'card', id: primaryCard._id });
    }
  }, [cards, paymentSelection]);

  const selectedShipping = SHIPPING_METHODS.find((method) => method.key === shippingKey);
  const discountAmount = appliedCoupon
    ? Number((Number(total) * (appliedCoupon.discount_percentage / 100)).toFixed(2))
    : 0;
  const total_with_shipping = Math.max(0, Number(total) - discountAmount) + Number(selectedShipping?.cost ?? 0);

  async function handleFinishOrder() {
    const address = addresses.find((item) => item._id === selectedAddressId);

    if (!address) {
      showToast('Selecciona una dirección de envío', 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('Ingresa un teléfono de contacto', 'error');
      return;
    }
    if (!paymentSelection) {
      showToast('Selecciona un método de pago', 'error');
      return;
    }

    const paymentMethodLabel =
      paymentSelection.type === 'applePay'
        ? 'Apple Pay'
        : (() => {
            const card = cards.find((item) => item._id === paymentSelection.id);
            return card ? `${card.brand} terminada en ${card.last4}` : 'Tarjeta';
          })();

    setIsSubmitting(true);
    try {
      const result = await checkout({
        shipping_address: `${address.street_and_number}, ${address.city}`,
        shipping_phone: phone,
        shipping_method: selectedShipping.key,
        shipping_cost: selectedShipping.cost,
        payment_method: paymentMethodLabel,
        payment_status: 'Simulado (sin cobro real)',
        coupon_code: appliedCoupon?.coupon_code || undefined,
      });

      navigation.replace('OrderConfirmation', {
        orderId: result.sale._id,
        shippingLabel: selectedShipping.label,
      });
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
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
        <Lock size={20} color={colors.text} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepBadge}>
              <AppText variant="bodyBold" style={styles.stepBadgeLabel}>
                1
              </AppText>
            </View>
            <AppText variant="headingSemiBold">Dirección de envío</AppText>
          </View>

          {addressesLoading ? <ActivityIndicator color={colors.text} /> : null}

          {!addressesLoading && addresses.length === 0 ? (
            <View style={styles.emptyBox}>
              <AppText variant="muted" style={styles.emptyBoxText}>
                Todavía no tienes direcciones guardadas.
              </AppText>
              <Button
                label="Agregar dirección"
                variant="outline"
                onPress={() => navigation.navigate('Addresses')}
              />
            </View>
          ) : null}

          {addresses.map((address) => (
            <Pressable
              key={address._id}
              style={[
                styles.optionCard,
                selectedAddressId === address._id && styles.optionCardActive,
              ]}
              onPress={() => setSelectedAddressId(address._id)}
            >
              <MapPin size={18} color={colors.text} />
              <View style={styles.optionText}>
                <AppText variant="bodySemiBold">{address.label || 'Dirección'}</AppText>
                <AppText variant="muted" style={styles.optionSubtitle}>
                  {address.street_and_number}, {address.city}
                </AppText>
              </View>
            </Pressable>
          ))}

          <TextField
            label="Teléfono (para notificaciones de entrega)"
            placeholder="00000000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            filter={digitsOnly}
            maxLength={12}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepBadge}>
              <AppText variant="bodyBold" style={styles.stepBadgeLabel}>
                2
              </AppText>
            </View>
            <AppText variant="headingSemiBold">Método de envío</AppText>
          </View>

          {SHIPPING_METHODS.map((method) => (
            <Pressable
              key={method.key}
              style={[styles.optionCard, shippingKey === method.key && styles.optionCardActive]}
              onPress={() => setShippingKey(method.key)}
            >
              <View style={styles.optionText}>
                <AppText variant="bodySemiBold">{method.label}</AppText>
                <AppText variant="muted" style={styles.optionSubtitle}>
                  {method.description}
                </AppText>
              </View>
              <AppText variant="bodySemiBold">
                {method.cost > 0 ? `$${method.cost.toFixed(2)} USD` : 'Gratis'}
              </AppText>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepBadge}>
              <AppText variant="bodyBold" style={styles.stepBadgeLabel}>
                3
              </AppText>
            </View>
            <AppText variant="headingSemiBold">Método de pago</AppText>
          </View>

          {cardsLoading ? <ActivityIndicator color={colors.text} /> : null}

          {cards.map((card) => {
            const isActive =
              paymentSelection?.type === 'card' && paymentSelection.id === card._id;
            return (
              <Pressable
                key={card._id}
                style={[styles.optionCard, isActive && styles.optionCardActive]}
                onPress={() => setPaymentSelection({ type: 'card', id: card._id })}
              >
                <CreditCard size={18} color={colors.text} />
                <View style={styles.optionText}>
                  <AppText variant="bodySemiBold">
                    {card.brand} •••• {card.last4}
                  </AppText>
                  <AppText variant="muted" style={styles.optionSubtitle}>
                    Vence {card.expiry_month}/{card.expiry_year}
                  </AppText>
                </View>
              </Pressable>
            );
          })}

          <Pressable
            style={[
              styles.optionCard,
              paymentSelection?.type === 'applePay' && styles.optionCardActive,
            ]}
            onPress={() => setPaymentSelection({ type: 'applePay' })}
          >
            <View style={styles.optionText}>
              <AppText variant="bodySemiBold">Apple Pay</AppText>
            </View>
          </Pressable>

          <Button
            label="Agregar tarjeta"
            variant="outline"
            onPress={() => navigation.navigate('PaymentMethods')}
          />
        </View>

        <View style={styles.summaryCard}>
          <AppText variant="headingSemiBold" style={styles.summaryTitle}>
            Resumen del pedido
          </AppText>

          {items.map((item) => (
            <View key={item.productId?._id} style={styles.summaryItemRow}>
              <AppText variant="bodyMedium" style={styles.summaryItemName} numberOfLines={1}>
                {item.quantity}x {item.productId?.name}
              </AppText>
              <AppText variant="bodyMedium">${Number(item.subtotal ?? 0).toFixed(2)}</AppText>
            </View>
          ))}

          <View style={styles.summaryDivider} />

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
          <View style={styles.summaryRow}>
            <AppText variant="muted">Envío</AppText>
            <AppText variant="bodySemiBold">
              {selectedShipping?.cost > 0 ? `$${selectedShipping.cost.toFixed(2)} USD` : 'Gratis'}
            </AppText>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <AppText variant="headingSemiBold">Total</AppText>
            <AppText variant="headingSemiBold">${total_with_shipping.toFixed(2)} USD</AppText>
          </View>

          <Button
            label="Finalizar Compra"
            icon={<Lock size={16} color={colors.white} />}
            loading={isSubmitting}
            disabled={items.length === 0}
            onPress={handleFinishOrder}
          />
          <AppText variant="muted" style={styles.disclaimer}>
            Este proyecto no procesa pagos reales: el pedido se guarda, pero no se realiza ningún
            cobro.
          </AppText>
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
    content: {
      padding: 20,
      paddingBottom: 40,
      gap: 28,
    },
    section: {
      gap: 12,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 4,
    },
    stepBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.black,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBadgeLabel: {
      fontSize: 12,
      color: colors.white,
    },
    emptyBox: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 18,
      gap: 12,
      alignItems: 'center',
    },
    emptyBoxText: {
      textAlign: 'center',
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: 'transparent',
      padding: 14,
    },
    optionCardActive: {
      borderColor: colors.black,
    },
    optionText: {
      flex: 1,
    },
    optionSubtitle: {
      marginTop: 2,
      fontSize: 12,
    },
    summaryCard: {
      backgroundColor: colors.cardTan,
      borderRadius: 20,
      padding: 22,
      gap: 12,
    },
    summaryTitle: {
      marginBottom: 4,
    },
    summaryItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    summaryItemName: {
      flex: 1,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: colors.borderStrong,
      marginVertical: 4,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    summaryTotalRow: {
      paddingTop: 10,
    },
    disclaimer: {
      textAlign: 'center',
      marginTop: 4,
    },
  });
}
