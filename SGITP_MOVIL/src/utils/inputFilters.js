// Filtros de teclado para TextField: cada uno recibe lo que el usuario
// acaba de escribir y devuelve la versión "limpia" (sin lo que no
// corresponde a ese campo). Se usan como prop `filter` de TextField.

// Solo letras (con acentos/ñ) y espacios — nombres, ciudades, etc.
export function lettersOnly(text = '') {
  return text.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, '');
}

// Solo dígitos — teléfonos, códigos, cantidades.
export function digitsOnly(text = '') {
  return text.replace(/[^0-9]/g, '');
}

// Letras, números y espacios (sin símbolos) — direcciones, referencias.
// Mismo patrón que valida el backend en customerController.js.
export function alphanumericSpaces(text = '') {
  return text.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]/g, '');
}

// Número de tarjeta: solo dígitos.
export function cardNumber(text = '') {
  return digitsOnly(text);
}

// Vencimiento de tarjeta: dígitos, con la "/" que separa MM de AA agregada sola.
export function cardExpiry(text = '') {
  const digits = digitsOnly(text).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
