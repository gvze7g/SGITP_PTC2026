import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Mail } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { CategoryTile } from '../components/CategoryTile';
import { IconBadge } from '../components/IconBadge';
import { ProductCard } from '../components/ProductCard';
import { StoreHeader } from '../components/StoreHeader';
import { TextField } from '../components/TextField';
import { colors } from '../constants/colors';
import { getCategoryIcon } from '../constants/categoryIcons';
import { useToast } from '../context/ToastContext';
import { useProducts } from '../hooks/useProducts';

// Pantalla "Inicio" (primera pestaña). Muestra un banner, las categorías
// que realmente existen en los productos cargados, una selección de
// productos y un formulario de newsletter (todavía sin backend, solo visual).
export function HomeStoreScreen({ navigation }) {
  const { data: products, isLoading, isError } = useProducts();
  const { showToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Las categorías del menú salen de los productos reales que ya cargaron
  // (no están escritas a mano), así funcionan sin importar qué haya en la base de datos.
  const categories = useMemo(() => {
    if (!products) return [];
    const unique = [...new Set(products.map((product) => product.category).filter(Boolean))];
    return unique.slice(0, 3);
  }, [products]);

  const featuredProducts = products?.slice(0, 6) ?? [];

  function handleSubscribe() {
    // No hay un endpoint de newsletter en el backend todavía: por ahora
    // solo confirmamos visualmente que se "envió".
    showToast('¡Gracias por suscribirte!', 'success');
    setNewsletterEmail('');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <StoreHeader />

        <Pressable
          style={styles.hero}
          onPress={() => navigation.navigate('Colección')}
        >
          <AppText variant="label" style={styles.heroEyebrow}>
            Nueva Colección
          </AppText>
          <AppText variant="headingMedium" style={styles.heroTitle}>
            Otoño Suave
          </AppText>
          <View style={styles.heroButton}>
            <AppText variant="bodyBold" style={styles.heroButtonLabel}>
              Descubrir
            </AppText>
          </View>
        </Pressable>

        <View style={styles.section}>
          <AppText variant="headingSemiBold">Categorías</AppText>
          <View style={styles.categoriesRow}>
            {categories.length === 0 ? (
              <AppText variant="muted">Todavía no hay categorías para mostrar.</AppText>
            ) : (
              categories.map((category) => {
                const Icon = getCategoryIcon(category);
                return (
                  <CategoryTile
                    key={category}
                    label={category}
                    icon={<Icon size={22} color={colors.text} />}
                    onPress={() => navigation.navigate('Colección', { category })}
                  />
                );
              })
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="headingSemiBold">Selección Premium</AppText>
            <Pressable onPress={() => navigation.navigate('Colección')} hitSlop={8}>
              <AppText variant="link" style={styles.seeAll}>
                Ver todo
              </AppText>
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.text} style={styles.loading} />
          ) : isError ? (
            <AppText variant="muted">No se pudieron cargar los productos.</AppText>
          ) : featuredProducts.length === 0 ? (
            <AppText variant="muted">Todavía no hay productos disponibles.</AppText>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  style={styles.horizontalCard}
                  onPress={() => navigation.navigate('ProductDetail', { productId: product._id })}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.newsletterCard}>
          <IconBadge size={48} backgroundColor={colors.background}>
            <Mail size={20} color={colors.text} />
          </IconBadge>
          <AppText variant="headingSemiBold" style={styles.newsletterTitle}>
            Únete a la Familia
          </AppText>
          <AppText variant="bodyRegular" style={styles.newsletterSubtitle}>
            Recibe acceso anticipado a nuevas colecciones y contenido exclusivo sobre el cuidado
            infantil.
          </AppText>
          <View style={styles.newsletterForm}>
            <View style={styles.newsletterInput}>
              <TextField
                placeholder="Tu correo electrónico"
                value={newsletterEmail}
                onChangeText={setNewsletterEmail}
                keyboardType="email-address"
              />
            </View>
            <Button label="Suscribir" onPress={handleSubscribe} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    marginHorizontal: 20,
    height: 300,
    borderRadius: 20,
    backgroundColor: colors.cardTan,
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroEyebrow: {
    marginBottom: 6,
  },
  heroTitle: {
    marginBottom: 16,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.black,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  heroButtonLabel: {
    color: colors.white,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: {
    textDecorationLine: 'underline',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  loading: {
    marginTop: 24,
  },
  horizontalCard: {
    width: 160,
    marginRight: 16,
    marginTop: 16,
  },
  newsletterCard: {
    margin: 20,
    marginTop: 36,
    marginBottom: 32,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  newsletterTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  newsletterSubtitle: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  newsletterForm: {
    alignSelf: 'stretch',
  },
  newsletterInput: {
    marginBottom: 4,
  },
});
