import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Leaf, Palette } from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { StoreHeader } from '../components/StoreHeader';
import { useTheme } from '../context/ThemeContext';

// Contenido de marca fijo (no viene de ningún backend, es la misma copia
// del mockup "Nuestra Historia"). Se llega acá desde el menú hamburguesa.
const PILLARS = [
  {
    icon: Leaf,
    title: 'Materiales Puros',
    description:
      'Seleccionamos exclusivamente algodones orgánicos y linos naturales que respetan la piel sensible de los más pequeños y el medio ambiente.',
  },
  {
    icon: Palette,
    title: 'Quiet Luxury',
    description:
      'Nuestra paleta de tonos neutros y siluetas limpias se integra perfectamente en el diseño de un hogar moderno y sofisticado.',
  },
  {
    icon: Heart,
    title: 'Diseño Atemporal',
    description:
      'Creamos piezas diseñadas para ser heredadas, con una confección impecable que resiste el paso del tiempo y las generaciones.',
  },
];

export function AboutScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <StoreHeader />

        <AppText variant="label" style={styles.eyebrow}>
          Nuestra Historia
        </AppText>
        <AppText variant="heading" style={styles.title}>
          Cuidando cada detalle desde el primer día.
        </AppText>
        <AppText variant="muted" style={styles.intro}>
          Nacimos con la convicción de que la estética del cuidado infantil puede ser elegante,
          calmada y profundamente respetuosa con el entorno de las familias contemporáneas.
        </AppText>

        <View style={styles.heroImage} />

        <AppText variant="headingSemiBold" style={styles.sectionTitle}>
          Nuestra Filosofía
        </AppText>
        <AppText variant="muted" style={styles.sectionSubtitle}>
          Diseñamos con propósito, priorizando la calidad atemporal sobre las tendencias
          efímeras.
        </AppText>

        <View style={styles.pillars}>
          {PILLARS.map(({ icon: Icon, title, description }, index) => (
            <View
              key={title}
              style={[styles.pillarCard, index === 0 ? styles.pillarCardStrong : null]}
            >
              <Icon size={22} color={colors.text} />
              <AppText variant="headingSemiBold" style={styles.pillarTitle}>
                {title}
              </AppText>
              <AppText variant="muted" style={styles.pillarText}>
                {description}
              </AppText>
            </View>
          ))}
        </View>

        <AppText variant="headingSemiBold" style={styles.sectionTitle}>
          Diseñado en el estudio, inspirado en la vida real.
        </AppText>
        <AppText variant="muted" style={styles.sectionSubtitle}>
          Cada colección de Peques comienza con la observación de las necesidades reales de los
          padres modernos. Buscamos el equilibrio perfecto entre funcionalidad absoluta y una
          estética elevada que aporta serenidad al hermoso caos de la crianza.
        </AppText>

        <Pressable onPress={() => navigation.navigate('MainTabs', { screen: 'Colección' })}>
          <AppText variant="link" style={styles.discoverLink}>
            Descubrir la colección
          </AppText>
        </Pressable>

        <View style={styles.imageRow}>
          <View style={styles.smallImage} />
          <View style={styles.smallImage} />
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
      paddingBottom: 40,
    },
    eyebrow: {
      marginTop: 8,
      paddingHorizontal: 20,
    },
    title: {
      marginTop: 8,
      paddingHorizontal: 20,
      fontSize: 28,
    },
    intro: {
      marginTop: 16,
      paddingHorizontal: 20,
      lineHeight: 22,
    },
    heroImage: {
      height: 220,
      marginTop: 24,
      marginHorizontal: 20,
      borderRadius: 20,
      backgroundColor: colors.surface,
    },
    sectionTitle: {
      marginTop: 36,
      paddingHorizontal: 20,
    },
    sectionSubtitle: {
      marginTop: 8,
      paddingHorizontal: 20,
      lineHeight: 20,
    },
    pillars: {
      marginTop: 20,
      paddingHorizontal: 20,
      gap: 14,
    },
    pillarCard: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 18,
      gap: 10,
    },
    pillarCardStrong: {
      backgroundColor: colors.cardTan,
      borderWidth: 0,
    },
    pillarTitle: {},
    pillarText: {
      lineHeight: 20,
    },
    discoverLink: {
      marginTop: 20,
      marginHorizontal: 20,
      textDecorationLine: 'underline',
    },
    imageRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
      paddingHorizontal: 20,
    },
    smallImage: {
      flex: 1,
      height: 110,
      borderRadius: 14,
      backgroundColor: colors.surface,
    },
  });
}
