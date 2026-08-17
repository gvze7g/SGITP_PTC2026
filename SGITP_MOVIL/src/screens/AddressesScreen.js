import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { FilterChip } from '../components/FilterChip';
import { ScreenHeader } from '../components/ScreenHeader';
import { TextField } from '../components/TextField';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { ADDRESS_CITIES, useAddresses } from '../hooks/useAddresses';
import { alphanumericSpaces } from '../utils/inputFilters';

const EMPTY_FORM = { label: '', street_and_number: '', city: '', reference: '', isPrimary: false };

// Pantalla "Direcciones Guardadas": no había mockup para esta, así que el
// diseño sigue el mismo lenguaje visual del resto de la app. CRUD real
// contra /customer/me/addresses (ver useAddresses.js).
export function AddressesScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showToast } = useToast();
  const { addresses, isLoading, addAddress, updateAddress, removeAddress } = useAddresses();

  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormVisible(true);
  }

  function openEditForm(address) {
    setEditingId(address._id);
    setForm({
      label: address.label ?? '',
      street_and_number: address.street_and_number ?? '',
      city: address.city ?? '',
      reference: address.reference ?? '',
      isPrimary: Boolean(address.isPrimary),
    });
    setFormVisible(true);
  }

  async function handleSubmit() {
    if (!form.street_and_number.trim() || !form.city) {
      showToast('Dirección y ciudad son obligatorias', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await addAddress(form);
      }
      showToast('Dirección guardada', 'success');
      setFormVisible(false);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmDelete(address) {
    Alert.alert('Eliminar dirección', '¿Seguro que quieres eliminar esta dirección?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeAddress(address._id);
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
          Direcciones Guardadas
        </AppText>
        <AppText variant="muted" style={styles.subtitle}>
          Gestiona tus lugares de entrega.
        </AppText>

        {isLoading ? <ActivityIndicator color={colors.text} style={styles.loading} /> : null}

        {!isLoading && addresses.length === 0 && !formVisible ? (
          <AppText variant="muted" style={styles.emptyState}>
            Todavía no tienes direcciones guardadas.
          </AppText>
        ) : null}

        <View style={styles.list}>
          {addresses.map((address) => (
            <View key={address._id} style={styles.card}>
              <MapPin size={18} color={colors.text} />
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <AppText variant="bodySemiBold">{address.label || 'Dirección'}</AppText>
                  {address.isPrimary ? (
                    <View style={styles.primaryBadge}>
                      <Star size={11} color={colors.white} />
                      <AppText variant="bodyBold" style={styles.primaryBadgeLabel}>
                        Principal
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <AppText variant="muted" style={styles.cardText}>
                  {address.street_and_number}, {address.city}
                </AppText>
                {address.reference ? (
                  <AppText variant="muted" style={styles.cardText}>
                    {address.reference}
                  </AppText>
                ) : null}
              </View>
              <View style={styles.cardActions}>
                <Pressable onPress={() => openEditForm(address)} hitSlop={8}>
                  <Pencil size={16} color={colors.textMuted} />
                </Pressable>
                <Pressable onPress={() => confirmDelete(address)} hitSlop={8}>
                  <Trash2 size={16} color={colors.error} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {formVisible ? (
          <View style={styles.form}>
            <TextField
              label="Nombre (ej. Casa, Oficina)"
              placeholder="Casa"
              value={form.label}
              onChangeText={(value) => setForm((prev) => ({ ...prev, label: value }))}
              filter={alphanumericSpaces}
              maxLength={30}
            />
            <TextField
              label="Dirección completa"
              placeholder="Calle, número, referencia"
              value={form.street_and_number}
              onChangeText={(value) => setForm((prev) => ({ ...prev, street_and_number: value }))}
              filter={alphanumericSpaces}
              maxLength={80}
            />

            <AppText variant="label" style={styles.cityLabel}>
              Ciudad
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityRow}>
              {ADDRESS_CITIES.map((city) => (
                <FilterChip
                  key={city}
                  label={city}
                  active={form.city === city}
                  onPress={() => setForm((prev) => ({ ...prev, city }))}
                />
              ))}
            </ScrollView>

            <TextField
              label="Referencia (opcional)"
              placeholder="Ej. casa color celeste, portón negro"
              value={form.reference}
              onChangeText={(value) => setForm((prev) => ({ ...prev, reference: value }))}
              filter={alphanumericSpaces}
              maxLength={80}
            />

            <Checkbox
              label="Marcar como dirección principal"
              checked={form.isPrimary}
              onToggle={() => setForm((prev) => ({ ...prev, isPrimary: !prev.isPrimary }))}
            />

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
            label="Agregar dirección"
            variant="outline"
            icon={<Plus size={16} color={colors.text} />}
            onPress={openCreateForm}
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
    cardActions: {
      gap: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    form: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 18,
      marginBottom: 20,
    },
    cityLabel: {
      marginBottom: 10,
    },
    cityRow: {
      marginBottom: 18,
    },
    formActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
    },
    formActionButton: {
      flex: 1,
    },
  });
}
