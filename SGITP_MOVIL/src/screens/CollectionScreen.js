import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { FilterChip } from '../components/FilterChip';
import { ProductCard } from '../components/ProductCard';
import { SearchInput } from '../components/SearchInput';
import { StoreHeader } from '../components/StoreHeader';
import { colors } from '../constants/colors';
import { useProducts } from '../hooks/useProducts';

const PAGE_SIZE = 6;

// Las 3 formas de ordenar la lista. Cada vez que se toca "Ordenar" se pasa
// a la siguiente de este array.
const SORT_MODES = [
  { key: 'relevancia', label: 'Relevancia' },
  { key: 'precio-asc', label: 'Precio: menor a mayor' },
  { key: 'precio-desc', label: 'Precio: mayor a menor' },
];

// Pantalla "Colección": buscador, filtro por categoría y grilla de
// productos. Todo el filtrado/orden se hace en el teléfono porque ya
// tenemos todos los productos descargados (no son tantos como para que
// haga falta pedirle esto al backend).
export function CollectionScreen({ route, navigation }) {
  const { data: products, isLoading, isError } = useProducts();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortIndex, setSortIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Si venimos de tocar una categoría en Inicio, la dejamos ya seleccionada.
  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(route.params.category);
    }
  }, [route.params?.category]);

  const categories = useMemo(() => {
    if (!products) return ['Todos'];
    const unique = [...new Set(products.map((product) => product.category).filter(Boolean))];
    return ['Todos', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let result = products;

    if (selectedCategory !== 'Todos') {
      result = result.filter((product) => product.category === selectedCategory);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter((product) => product.name?.toLowerCase().includes(term));
    }

    const sortKey = SORT_MODES[sortIndex].key;
    if (sortKey === 'precio-asc') {
      result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortKey === 'precio-desc') {
      result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    return result;
  }, [products, selectedCategory, search, sortIndex]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <StoreHeader />
            <View style={styles.searchWrapper}>
              <SearchInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar colección..."
              />
            </View>

            {/* ScrollView y no FlatList: React Native no recomienda anidar una
                lista virtualizada dentro de otra, y acá son solo unos pocos chips. */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {categories.map((item) => (
                <FilterChip
                  key={item}
                  label={item}
                  active={selectedCategory === item}
                  onPress={() => {
                    setSelectedCategory(item);
                    setVisibleCount(PAGE_SIZE);
                  }}
                />
              ))}
            </ScrollView>

            <View style={styles.toolbar}>
              <AppText variant="muted">{filteredProducts.length} Artículos</AppText>
              <View style={styles.toolbarActions}>
                <Pressable style={styles.toolbarButton} hitSlop={8}>
                  <SlidersHorizontal size={14} color={colors.text} />
                  <AppText variant="bodySemiBold" style={styles.toolbarLabel}>
                    Filtros
                  </AppText>
                </Pressable>
                <Pressable
                  style={styles.toolbarButton}
                  onPress={() => setSortIndex((prev) => (prev + 1) % SORT_MODES.length)}
                  hitSlop={8}
                >
                  <ArrowUpDown size={14} color={colors.text} />
                  <AppText variant="bodySemiBold" style={styles.toolbarLabel}>
                    Ordenar
                  </AppText>
                </Pressable>
              </View>
            </View>

            {isLoading ? <ActivityIndicator color={colors.text} style={styles.loading} /> : null}
            {isError ? (
              <AppText variant="muted" style={styles.emptyState}>
                No se pudieron cargar los productos.
              </AppText>
            ) : null}
            {!isLoading && !isError && filteredProducts.length === 0 ? (
              <AppText variant="muted" style={styles.emptyState}>
                No encontramos productos con esos filtros.
              </AppText>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            style={styles.gridCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
          />
        )}
        ListFooterComponent={
          hasMore ? (
            <View style={styles.loadMoreWrapper}>
              <Button
                label="Cargar más"
                variant="outline"
                onPress={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              />
            </View>
          ) : null
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
  },
  searchWrapper: {
    marginTop: 4,
    marginBottom: 16,
  },
  chipsRow: {
    paddingBottom: 16,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 16,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolbarLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  loading: {
    marginTop: 24,
  },
  emptyState: {
    textAlign: 'center',
    marginTop: 40,
  },
  row: {
    gap: 16,
  },
  gridCard: {
    flex: 1,
    marginBottom: 24,
  },
  loadMoreWrapper: {
    marginTop: 8,
  },
});
