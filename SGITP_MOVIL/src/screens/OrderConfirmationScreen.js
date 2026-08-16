import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { IconBadge } from '../components/IconBadge';
import { useTheme } from '../context/ThemeContext';

const SHIPPING_ESTIMATES = {
  Standard: '3 - 5 días laborables',
  Express: '24 - 48 horas laborables',
};

// Pantalla "Gracias": confirma que el pedido se creó de verdad (route.params
// trae el _id real que devolvió POST /cart/mine/checkout). No tiene botón
// de "volver" a propósito: una vez hecho el pedido no tiene sentido
// regresar al checkout.
export function OrderConfirmationScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { orderId, shippingLabel } = route.params ?? {};

  const orderCode = orderId ? `PQ-${orderId.slice(-6).toUpperCase()}` : 'PQ-000000';
  const estimate = SHIPPING_ESTIMATES[shippingLabel] ?? SHIPPING_ESTIMATES.Standard;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <IconBadge size={80} backgroundColor={colors.surface}>
          <Check size={32} color={colors.text} />
        </IconBadge>

        <AppText variant="heading" style={styles.title}>
          Gracias.
        </AppText>
        <AppText variant="muted" style={styles.subtitle}>
          Tu pedido ha sido confirmado. Nos pondremos a trabajar en él de inmediato con el mayor
          de los cuidados.
        </AppText>

        <View style={styles.card}>
          <AppText variant="label" style={styles.cardLabel}>
            N° de pedido
          </AppText>
          <AppText variant="headingMedium">{orderCode}</AppText>

          <View style={styles.cardDivider} />

          <AppText variant="label" style={styles.cardLabel}>
            Envío estimado
          </AppText>
          <AppText variant="bodySemiBold">{estimate}</AppText>
        </View>

        <View style={styles.buttons}>
          <Button
            label="Seguir Comprando"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Inicio' })}
          />
          <Button label="Ver Pedido" variant="outline" onPress={() => navigation.replace('Orders')} />
        </View>
      </View>
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
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    title: {
      textAlign: 'center',
      marginTop: 20,
    },
    subtitle: {
      textAlign: 'center',
      marginTop: 12,
      lineHeight: 20,
    },
    card: {
      marginTop: 32,
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 20,
    },
    cardLabel: {
      marginBottom: 4,
    },
    cardDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
    buttons: {
      marginTop: 32,
      gap: 12,
    },
  });
}
