// Reglas de validación compartidas por los controllers. Son las mismas que
// aplican la web y la app móvil, repetidas aquí para que nadie pueda
// saltárselas llamando a la API directamente.

export const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_PATTERN = /^\d{8,12}$/;
export const PASSWORD_MIN_LENGTH = 8;

export function isValidName(value, minLength = 3, maxLength = 50) {
  const trimmed = String(value ?? "").trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength && NAME_PATTERN.test(trimmed);
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? "").trim());
}

export function isValidPhone(value) {
  return PHONE_PATTERN.test(String(value ?? "").trim());
}

// Mes "01"-"12" y año de 2 dígitos, sin estar vencida.
export function isValidCardExpiry(month, year) {
  if (!/^\d{2}$/.test(String(month ?? "")) || !/^\d{2}$/.test(String(year ?? ""))) {
    return false;
  }

  const monthNumber = Number(month);
  const yearNumber = Number(year);
  if (monthNumber < 1 || monthNumber > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  return yearNumber > currentYear || (yearNumber === currentYear && monthNumber >= currentMonth);
}

export function isValidObjectId(value) {
  return /^[a-f\d]{24}$/i.test(String(value ?? ""));
}

// Cantidades de carrito/venta: enteros positivos, sin decimales ni texto.
export function isPositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
}
