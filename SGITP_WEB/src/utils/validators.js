// Validaciones de formulario reutilizables. Complementan a inputFilters.js:
// los filtros impiden escribir caracteres que no corresponden, y estas
// funciones revisan al enviar que el valor completo tenga sentido (que no
// este vacio, que tenga el largo correcto, que la fecha no este vencida...).

export const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;
export const ALPHANUMERIC_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidName(value = '', minLength = 3) {
  const trimmed = value.trim();
  return trimmed.length >= minLength && NAME_PATTERN.test(trimmed);
}

export function isValidEmail(value = '') {
  return EMAIL_PATTERN.test(value.trim());
}

// Telefonos de El Salvador: 8 digitos (se aceptan hasta 12 por si incluyen
// codigo de pais, igual que el backend).
export function isValidPhone(value = '') {
  return /^\d{8,12}$/.test(value.trim());
}

// Tarjetas de prueba: solo se revisa el formato, no que la tarjeta exista.
export function isValidCardNumber(value = '') {
  return /^\d{13,19}$/.test(value);
}

// MM/YY con mes valido y que no haya vencido.
export function isValidCardExpiry(value = '') {
  if (!/^\d{2}\/\d{2}$/.test(value)) return false;

  const [month, year] = value.split('/').map(Number);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  return year > currentYear || (year === currentYear && month >= currentMonth);
}

// Visa y Mastercard usan 3 digitos; cualquier otra marca acepta 3 o 4.
export function getCvvLength(brand) {
  return brand === 'Visa' || brand === 'Mastercard' ? { min: 3, max: 3 } : { min: 3, max: 4 };
}

export function isValidCvv(value = '', brand) {
  const { min, max } = getCvvLength(brand);
  return /^\d+$/.test(value) && value.length >= min && value.length <= max;
}
