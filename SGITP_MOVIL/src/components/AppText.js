import { useMemo } from 'react';
import { Text } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { fontFamily } from '../constants/typography';

// Texto reutilizable: se usa como <AppText variant="heading">Hola</AppText>
// en vez de repetir los estilos de fuente en cada pantalla. Los que empiezan
// con "heading" usan Montserrat (títulos) y el resto usa Manrope (texto
// normal). Los colores salen del tema activo (ver ThemeContext) para que el
// texto se vea bien tanto en modo claro como oscuro.
export function AppText({ variant = 'bodyRegular', style, ...props }) {
  const { colors } = useTheme();

  const VARIANTS = useMemo(
    () => ({
      heading: { fontFamily: fontFamily.headingRegular, fontSize: 32, color: colors.text },
      headingMedium: { fontFamily: fontFamily.headingMedium, fontSize: 22, color: colors.text },
      headingSemiBold: {
        fontFamily: fontFamily.headingSemiBold,
        fontSize: 18,
        color: colors.text,
      },
      wordmark: {
        fontFamily: fontFamily.headingMedium,
        fontSize: 24,
        letterSpacing: 6,
        color: colors.text,
      },
      bodyRegular: { fontFamily: fontFamily.bodyRegular, fontSize: 15, color: colors.text },
      bodyMedium: { fontFamily: fontFamily.bodyMedium, fontSize: 15, color: colors.text },
      bodySemiBold: { fontFamily: fontFamily.bodySemiBold, fontSize: 15, color: colors.text },
      bodyBold: { fontFamily: fontFamily.bodyBold, fontSize: 15, color: colors.text },
      muted: { fontFamily: fontFamily.bodyRegular, fontSize: 14, color: colors.textMuted },
      label: {
        fontFamily: fontFamily.bodySemiBold,
        fontSize: 11,
        letterSpacing: 1,
        color: colors.textMuted,
        textTransform: 'uppercase',
      },
      link: { fontFamily: fontFamily.bodySemiBold, fontSize: 13, color: colors.text },
    }),
    [colors]
  );

  return <Text style={[VARIANTS[variant], style]} {...props} />;
}
