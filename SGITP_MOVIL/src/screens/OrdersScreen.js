import { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Package } from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { StoreHeader } from '../components/StoreHeader';
import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../hooks/useOrders';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Pantalla "Mis Pedidos": historial real (GET /sales/mine). El backend no
// guarda un estado de envío ("en camino"/"entregado"), solo payment_status,
// así que se muestra eso tal cual en vez de inventar un seguimiento que no existe.
export function OrdersScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: orders, isLoading } = useOrders();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={orders ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <StoreHeader />
            <AppText variant="heading" style={styles.title}>
              Mis Pedidos
            </AppText>
            <AppText variant="muted" style={styles.subtitle}>
              Revisa el estado de tus compras recientes.
            </AppText>
          </>
        }
        renderItem={({ item }) => {
          const total = (item.item_details ?? []).reduce(
            (sum, line) => sum + Number(line.unit_price ?? 0) * Number(line.quantity ?? 0),
            Number(item.shipping_cost ?? 0)
          );

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <AppText variant="muted" style={styles.cardDate}>
                    {formatDate(item.createdAt)}
                  </AppText>
                  <AppText variant="bodySemiBold">#{item._id.slice(-8).toUpperCase()}</AppText>
                </View>
                <View style={styles.statusBadge}>
                  <AppText variant="bodySemiBold" style={styles.statusLabel}>
                    {item.payment_status || 'Pendiente'}
                  </AppText>
                </View>
              </View>

              <View style={styles.thumbnailsRow}>
                {(item.item_details ?? []).slice(0, 4).map((line, index) => {
                  const image = line.product_id?.images?.[0]?.image;
                  return image ? (
                    <Image
                      key={line._id ?? index}
                      source={{ uri: image }}
                      style={styles.thumbnail}
                      contentFit="cover"
                    />
                  ) : (
                    <View key={line._id ?? index} style={[styles.thumbnail, styles.thumbnailEmpty]} />
                  );
                })}
              </View>

              <AppText variant="headingSemiBold" style={styles.cardTotal}>
                ${total.toFixed(2)} USD
              </AppText>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.text} style={styles.loading} />
          ) : (
            <View style={styles.emptyState}>
              <Package size={32} color={colors.textMuted} />
              <AppText variant="muted" style={styles.emptyText}>
                Todavía no has hecho ningún pedido.
              </AppText>
            </View>
          )
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
      paddingBottom: 32,
      flexGrow: 1,
    },
    title: {
      marginTop: 8,
    },
    subtitle: {
      marginTop: 4,
      marginBottom: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 18,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardDate: {
      fontSize: 12,
      marginBottom: 2,
    },
    statusBadge: {
      backgroundColor: colors.background,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    statusLabel: {
      fontSize: 11,
      textTransform: 'uppercase',
    },
    thumbnailsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 14,
    },
    thumbnail: {
      width: 52,
      height: 52,
      borderRadius: 10,
    },
    thumbnailEmpty: {
      backgroundColor: colors.border,
    },
    cardTotal: {
      marginTop: 14,
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
  });
}
