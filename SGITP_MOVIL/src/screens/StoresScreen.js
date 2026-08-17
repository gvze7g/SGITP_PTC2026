import { useMemo } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation, Phone } from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { StoreHeader } from '../components/StoreHeader';
import { useTheme } from '../context/ThemeContext';
import { useBranches } from '../hooks/useBranches';

// Pantalla "Tiendas": lista las sucursales activas (GET /branches/public,
// la misma ruta pública que usa la web). El backend no guarda horario ni
// coordenadas todavía, así que "Indicaciones" abre el mapa del teléfono
// buscando la dirección en vez de mostrar un mapa embebido con pines.
export function StoresScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: branches, isLoading, isError } = useBranches();

  function openDirections(address) {
    if (!address) return;
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
  }

  function callBranch(phone) {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <StoreHeader />

        <AppText variant="heading" style={styles.title}>
          Nuestras Tiendas
        </AppText>
        <AppText variant="muted" style={styles.description}>
          Descubre nuestros espacios diseñados con la misma atención al detalle que nuestras
          colecciones. Encuentra la tienda más cercana y visítanos para una experiencia de compra
          personalizada.
        </AppText>

        {isLoading ? <ActivityIndicator color={colors.text} style={styles.loading} /> : null}
        {isError ? (
          <AppText variant="muted" style={styles.emptyState}>
            No se pudieron cargar las tiendas.
          </AppText>
        ) : null}
        {!isLoading && !isError && branches?.length === 0 ? (
          <AppText variant="muted" style={styles.emptyState}>
            Todavía no hay tiendas registradas.
          </AppText>
        ) : null}

        <View style={styles.list}>
          {(branches ?? []).map((branch) => (
            <View key={branch._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <AppText variant="headingSemiBold" style={styles.cardName}>
                  {branch.name}
                </AppText>
                <MapPin size={20} color={colors.text} />
              </View>

              {branch.address ? (
                <AppText variant="muted" style={styles.cardLine}>
                  {branch.address}
                </AppText>
              ) : null}

              {branch.phone ? (
                <View style={styles.cardRow}>
                  <Phone size={14} color={colors.textMuted} />
                  <AppText variant="muted" style={styles.cardRowText}>
                    {branch.phone}
                  </AppText>
                </View>
              ) : null}

              <View style={styles.cardActions}>
                <Pressable
                  style={styles.directionsButton}
                  onPress={() => openDirections(branch.address)}
                >
                  <Navigation size={14} color={colors.white} />
                  <AppText variant="bodyBold" style={styles.directionsLabel}>
                    Indicaciones
                  </AppText>
                </Pressable>
                {branch.phone ? (
                  <Pressable style={styles.callButton} onPress={() => callBranch(branch.phone)}>
                    <AppText variant="bodyBold" style={styles.callLabel}>
                      Llamar
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
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
    content: {
      paddingBottom: 32,
    },
    title: {
      textAlign: 'center',
      marginTop: 12,
      paddingHorizontal: 20,
    },
    description: {
      textAlign: 'center',
      marginTop: 12,
      paddingHorizontal: 24,
      lineHeight: 20,
    },
    loading: {
      marginTop: 32,
    },
    emptyState: {
      textAlign: 'center',
      marginTop: 32,
      paddingHorizontal: 24,
    },
    list: {
      paddingHorizontal: 20,
      marginTop: 28,
      gap: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    cardName: {
      flex: 1,
    },
    cardLine: {
      marginTop: 8,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    cardRowText: {
      fontSize: 14,
    },
    cardActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 18,
    },
    directionsButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 46,
      borderRadius: 12,
      backgroundColor: colors.black,
    },
    directionsLabel: {
      color: colors.white,
      fontSize: 12,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    callButton: {
      paddingHorizontal: 18,
      height: 46,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    callLabel: {
      fontSize: 12,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.text,
    },
  });
}
