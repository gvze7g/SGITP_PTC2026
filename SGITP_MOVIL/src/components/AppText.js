import { Text } from 'react-native';

import { colors } from '../constants/colors';
import { fontFamily } from '../constants/typography';

// Estilos de texto listos para usar en toda la app (así no hay que escribir
// fontFamily/fontSize/color cada vez). Los que empiezan con "heading" usan
// Montserrat (títulos) y el resto usa Manrope (texto normal).
const VARIANTS = {
  heading: { fontFamily: fontFamily.headingRegular, fontSize: 32, color: colors.text },
  headingMedium: { fontFamily: fontFamily.headingMedium, fontSize: 22, color: colors.text },
  headingSemiBold: { fontFamily: fontFamily.headingSemiBold, fontSize: 18, color: colors.text },
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
};

// Texto reutilizable: se usa como <AppText variant="heading">Hola</AppText>
// en vez de repetir los estilos de fuente en cada pantalla.
export function AppText({ variant = 'bodyRegular', style, ...props }) {
  return <Text style={[VARIANTS[variant], style]} {...props} />;
}
