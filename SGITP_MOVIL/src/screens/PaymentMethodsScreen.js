import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Plus, Star, Trash2 } from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { TextField } from '../components/TextField';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getCardBrand, getCardLast4, usePaymentMethods } from '../hooks/usePaymentMethods';
import { cardExpiry, cardNumber as filterCardNumber, lettersOnly } from '../utils/inputFilters';

const EMPTY_FORM = { cardNumber: '', expiry: '', holderName: '' };

// Pantalla "Métodos de Pago": tampoco tenía mockup. Guarda tarjetas de
// verdad (POST /paymentMethod/mine), pero el número completo y el CVC
// nunca salen del teléfono: solo se manda la marca y los últimos 4
// dígitos (ver usePaymentMethods.js), suficiente para reconocer la
// tarjeta en Checkout sin guardar datos sensibles.
export function PaymentMethodsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showToast } = useToast();
  const { cards, isLoading, addCard, setPrimaryCard, removeCard } = usePaymentMethods();

  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const digits = form.cardNumber.replace(/\D/g, '');
    const [month, year] = form.expiry.split('/').map((part) => part?.trim());

    if (digits.length < 12) {
      showToast('Número de tarjeta inválido', 'error');
      return;
    }
    if (!month || !year) {
      showToast('Ingresa el vencimiento como MM/AA', 'error');
      return;
    }
    if (!form.holderName.trim()) {
      showToast('Ingresa el nombre del titular', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCard({
        brand: getCardBrand(digits),
        last4: getCardLast4(digits),
        expiry_month: month,
        expiry_year: year,
        holder_name: form.holderName.trim(),
        isPrimary: cards.length === 0,
      });
      showToast('Tarjeta guardada', 'success');
      setForm(EMPTY_FORM);
      setFormVisible(false);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmDelete(card) {
    Alert.alert('Eliminar tarjeta', `¿Quitar la tarjeta terminada en ${card.last4}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeCard(card._id);
          } catch (error) {
            showToast(error.message, 'error');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppText variant="headingMedium" style={styles.title}>
          Métodos de Pago
        </AppText>
        <AppText variant="muted" style={styles.subtitle}>
          Tarjetas y preferencias de facturación.
        </AppText>

        {isLoading ? <ActivityIndicator color={colors.text} style={styles.loading} /> : null}

        {!isLoading && cards.length === 0 && !formVisible ? (
          <AppText variant="muted" style={styles.emptyState}>
            Todavía no tienes tarjetas guardadas.
          </AppText>
        ) : null}

        <View style={styles.list}>
          {cards.map((card) => (
            <View key={card._id} style={styles.card}>
              <CreditCard size={20} color={colors.text} />
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <AppText variant="bodySemiBold">
                    {card.brand} •••• {card.last4}
                  </AppText>
                  {card.isPrimary ? (
                    <View style={styles.primaryBadge}>
                      <Star size={11} color={colors.white} />
                      <AppText variant="bodyBold" style={styles.primaryBadgeLabel}>
                        Principal
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <AppText variant="muted" style={styles.cardText}>
                  Vence {card.expiry_month}/{card.expiry_year} · {card.holder_name}
                </AppText>
                {!card.isPrimary ? (
                  <Pressable onPress={() => setPrimaryCard(card._id)} hitSlop={8}>
                    <AppText variant="link" style={styles.setPrimaryLink}>
                      Marcar como principal
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
              <Pressable onPress={() => confirmDelete(card)} hitSlop={8}>
                <Trash2 size={16} color={colors.error} />
              </Pressable>
            </View>
          ))}
        </View>

        {formVisible ? (
          <View style={styles.form}>
            <TextField
              label="Número de tarjeta"
              placeholder="0000 0000 0000 0000"
              value={form.cardNumber}
              onChangeText={(value) => setForm((prev) => ({ ...prev, cardNumber: value }))}
              keyboardType="number-pad"
              filter={filterCardNumber}
              maxLength={19}
            />
            <TextField
              label="Vencimiento (MM/AA)"
              placeholder="12/28"
              value={form.expiry}
              onChangeText={(value) => setForm((prev) => ({ ...prev, expiry: value }))}
              keyboardType="number-pad"
              filter={cardExpiry}
              maxLength={5}
            />
            <TextField
              label="Nombre en la tarjeta"
              placeholder="Como aparece en la tarjeta"
              value={form.holderName}
              onChangeText={(value) => setForm((prev) => ({ ...prev, holderName: value }))}
              filter={lettersOnly}
              maxLength={60}
            />

            <AppText variant="muted" style={styles.disclaimer}>
              Solo guardamos la marca y los últimos 4 dígitos: nunca el número completo ni el CVC.
            </AppText>

            <View style={styles.formActions}>
              <View style={styles.formActionButton}>
                <Button label="Cancelar" variant="outline" onPress={() => setFormVisible(false)} />
              </View>
              <View style={styles.formActionButton}>
                <Button label="Guardar" loading={isSubmitting} onPress={handleSubmit} />
              </View>
            </View>
          </View>
        ) : (
          <Button
            label="Agregar tarjeta"
            variant="outline"
            icon={<Plus size={16} color={colors.text} />}
            onPress={() => setFormVisible(true)}
          />
        )}
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
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    title: {
      marginTop: 4,
    },
    subtitle: {
      marginTop: 4,
      marginBottom: 20,
    },
    loading: {
      marginTop: 24,
    },
    emptyState: {
      marginBottom: 20,
    },
    list: {
      gap: 12,
      marginBottom: 20,
    },
    card: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      alignItems: 'flex-start',
    },
    cardBody: {
      flex: 1,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    primaryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.black,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    primaryBadgeLabel: {
      color: colors.white,
      fontSize: 10,
      textTransform: 'uppercase',
    },
    cardText: {
      marginTop: 4,
    },
    setPrimaryLink: {
      marginTop: 8,
      textDecorationLine: 'underline',
    },
    form: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 18,
      marginBottom: 20,
    },
    disclaimer: {
      marginTop: -6,
      marginBottom: 16,
      lineHeight: 18,
    },
    formActions: {
      flexDirection: 'row',
      gap: 12,
    },
    formActionButton: {
      flex: 1,
    },
  });
}
