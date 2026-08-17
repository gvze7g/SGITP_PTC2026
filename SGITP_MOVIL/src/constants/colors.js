// Paleta oficial del proyecto (los 3 tonos que dio el diseño) para modo
// claro, y su inversa cálida para modo oscuro. Todo lo demás (bordes,
// resplandores, etc.) sale de mezclar estos 3 colores en cada modo.
const LIGHT_PALETTE = {
  cream: '#FFF8F4', // el más claro, fondo de toda la app
  beige: '#EADCD0', // tono medio, para tarjetas suaves e inputs rellenos
  tan: '#D4C5B9', // el más oscuro, para tarjetas destacadas y bordes
};

const DARK_PALETTE = {
  ink: '#17130F', // el más oscuro, fondo de toda la app en modo oscuro
  umber: '#241E17', // tono medio, para tarjetas suaves e inputs rellenos
  clay: '#3A3025', // el más claro de los 3, para tarjetas destacadas y bordes
};

// "black"/"white" no son literales: son la superficie rellena de más
// contraste (botones primarios, chips activos, tab activo) y el color que
// va encima de ella. En modo oscuro se invierten (superficie clara sobre
// fondo oscuro) para que un botón "negro" no se pierda contra un fondo
// casi negro.
export const lightColors = {
  background: LIGHT_PALETTE.cream,
  surface: LIGHT_PALETTE.beige,
  border: LIGHT_PALETTE.beige,
  borderStrong: LIGHT_PALETTE.tan,
  cardTan: LIGHT_PALETTE.tan,
  otpBox: LIGHT_PALETTE.beige,
  glow: 'rgba(212, 197, 185, 0.35)',

  black: '#181410',
  text: '#1E1913',
  textMuted: '#8B8177',
  placeholder: '#ABA095',
  white: '#FFFFFF',
  error: '#C0392B',
  success: '#2F7D4F',
  overlay: 'rgba(24, 20, 16, 0.4)',
};

export const darkColors = {
  background: DARK_PALETTE.ink,
  surface: DARK_PALETTE.umber,
  border: DARK_PALETTE.umber,
  borderStrong: DARK_PALETTE.clay,
  cardTan: DARK_PALETTE.clay,
  otpBox: DARK_PALETTE.umber,
  glow: 'rgba(212, 197, 185, 0.12)',

  black: '#F5EFE6',
  text: '#F2ECE3',
  textMuted: '#9C9184',
  placeholder: '#6E6558',
  white: '#17130F',
  error: '#E0574A',
  success: '#46A06B',
  overlay: 'rgba(0, 0, 0, 0.55)',
};

// Export de compatibilidad: código fuera de componentes (fuera de React,
// donde no se puede usar useTheme()) sigue viendo la paleta clara por
// defecto. Dentro de componentes siempre se debe usar useTheme() en su lugar.
export const colors = lightColors;
