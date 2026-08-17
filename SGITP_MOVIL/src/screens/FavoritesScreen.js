import { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { FavoriteCard } from '../components/FavoriteCard';
import { StoreHeader } from '../components/StoreHeader';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useProducts } from '../hooks/useProducts';

// Pantalla "Favoritos": muestra los productos que el usuario marcó con el
// corazón. La lista de ids favoritos viene de la API (ver FavoritesContext),
// y acá se cruza con el catálogo completo para tener los datos del producto.
export function FavoritesScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <StoreHeader />
            <AppText variant="heading" style={styles.title}>
              Tus Favoritos
            </AppText>
            <AppText variant="muted" style={styles.subtitle}>
              {favoriteProducts.length}{' '}
              {favoriteProducts.length === 1 ? 'artículo guardado' : 'artículos guardados'}
            </AppText>
          </>
        }
        renderItem={({ item }) => (
          <FavoriteCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
      marginTop: 4,
    },
    subtitle: {
      marginTop: 4,
      marginBottom: 20,
    },
    separator: {
      height: 20,
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
}
