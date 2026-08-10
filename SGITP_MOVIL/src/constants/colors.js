// Paleta oficial del proyecto (los 3 tonos que dio el diseño).
// Todo lo demás (bordes, resplandores, etc.) sale de mezclar estos 3 colores.
const PALETTE = {
  cream: '#FFF8F4', // el más claro, fondo de toda la app
  beige: '#EADCD0', // tono medio, para tarjetas suaves e inputs rellenos
  tan: '#D4C5B9', // el más oscuro, para tarjetas destacadas y bordes
};

export const colors = {
  background: PALETTE.cream,
  surface: PALETTE.beige,
  border: PALETTE.beige,
  borderStrong: PALETTE.tan,
  cardTan: PALETTE.tan,
  otpBox: PALETTE.beige,
  glow: 'rgba(212, 197, 185, 0.35)', // el tono "tan" pero transparente, para el resplandor del logo

  // Colores que no vienen del diseño de marca, son de uso general (texto, botones, avisos)
  black: '#181410',
  text: '#1E1913',
  textMuted: '#8B8177',
  placeholder: '#ABA095',
  white: '#FFFFFF',
  error: '#C0392B',
  success: '#2F7D4F',
  overlay: 'rgba(24, 20, 16, 0.4)',
};
