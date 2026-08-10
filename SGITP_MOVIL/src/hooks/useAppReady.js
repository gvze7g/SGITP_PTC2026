import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { appFonts } from '../constants/typography';

// Si las fuentes tardan más de esto, dejamos de esperar y mostramos la app
// igual (con la fuente del sistema) en vez de quedarnos pegados para siempre.
const FONT_LOAD_TIMEOUT_MS = 6000;

// Se encarga de cargar las fuentes Montserrat/Manrope y de avisarle a la
// pantalla de carga nativa cuándo puede desaparecer.
export function useAppReady() {
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const [timedOut, setTimedOut] = useState(false);
  const isReady = fontsLoaded || Boolean(fontError) || timedOut;

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), FONT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  return { isReady };
}
