import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Logo } from '../components/Logo';
import { colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

// Cuánto tiempo mínimo se muestra esta pantalla, aunque todo cargue más rápido.
const MIN_DISPLAY_MS = 1800;

// Pantalla de bienvenida que se ve justo después de abrir la app (antes de
// llegar a Login o Home). Es la "pantalla de carga personalizada" además
// del splash nativo: muestra el logo con una animación suave.
export function SplashScreen({ navigation }) {
  const { user, isBootstrapping } = useAuth(); // isBootstrapping: true mientras revisamos si ya había una sesión guardada
  const [minDelayDone, setMinDelayDone] = useState(false);

  // Valores animados: la opacidad y el tamaño del logo, y la opacidad del texto de abajo.
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Primero aparece el logo (con un pequeño rebote), y después el texto de abajo.
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => setMinDelayDone(true), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [logoOpacity, logoScale, taglineOpacity]);

  // Quiénos vamos: a Home si ya hay sesión, a Login si no. Esperamos tanto
  // el tiempo mínimo de la animación como a que termine de revisar la sesión.
  useEffect(() => {
    if (minDelayDone && !isBootstrapping) {
      navigation.replace(user ? 'MainTabs' : 'Login');
    }
  }, [minDelayDone, isBootstrapping, user, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.glow} pointerEvents="none" />

      <Animated.View
        style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}
      >
        <Logo size={150} />
      </Animated.View>

      <Animated.View style={[styles.taglineWrapper, { opacity: taglineOpacity }]}>
        <AppText variant="wordmark" style={styles.wordmark}>
          PEQUES
        </AppText>
        <AppText variant="label" style={styles.tagline}>
          Minimal Luxury Nursery
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  glow: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: colors.glow,
  },
  taglineWrapper: {
    alignItems: 'center',
    marginTop: 22,
  },
  wordmark: {
    fontSize: 18,
  },
  tagline: {
    marginTop: 6,
  },
});
