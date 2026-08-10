import { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { ProductCard } from '../components/ProductCard';
import { StoreHeader } from '../components/StoreHeader';
import { colors } from '../constants/colors';
import { useFavorites } from '../context/FavoritesContext';
import { useProducts } from '../hooks/useProducts';

// Pantalla "Favoritos": muestra los productos que el usuario marcó con el
// corazón. Por ahora esa lista solo vive en memoria (ver FavoritesContext),
// no hay todavía un backend que la guarde permanentemente.
export function FavoritesScreen({ navigation }) {
  const { data: products, isLoading } = useProducts();
  const { favoriteIds } = useFavorites();

  const favoriteProducts = useMemo(
    () => (products ?? []).filter((product) => favoriteIds.has(product._id)),
    [products, favoriteIds]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={favoriteProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <StoreHeader />
            <AppText variant="headingSemiBold" style={styles.title}>
              Favoritos
            </AppText>
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            style={styles.gridCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.text} style={styles.loading} />
          ) : (
            <View style={styles.emptyState}>
              <Heart size={32} color={colors.textMuted} />
              <AppText variant="muted" style={styles.emptyText}>
                Todavía no has marcado productos como favoritos.
              </AppText>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 16,
  },
  row: {
    gap: 16,
  },
  gridCard: {
    flex: 1,
    marginBottom: 24,
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
    paddingHorizontal: 40,
  },
});
