// Filtros de teclado reutilizables para inputs de texto: cada uno recibe lo
// que el usuario acaba de escribir y devuelve la version "limpia" (sin lo
// que no corresponde a ese campo).

// Solo letras (con acentos/enie) y espacios - nombres, etc.
export function lettersOnly(value = '') {
  return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü ]/g, '');
}

// Solo digitos - telefonos, codigos postales, cantidades.
export function digitsOnly(value = '') {
  return value.replace(/[^0-9]/g, '');
}

// Letras, numeros y espacios (sin simbolos) - direcciones, referencias.
export function alphanumericSpaces(value = '') {
  return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]/g, '');
}

// Numero de tarjeta: solo digitos.
export function cardNumber(value = '') {
  return digitsOnly(value);
}

// Vencimiento de tarjeta: digitos, con la "/" que separa MM de AA agregada sola.
export function cardExpiry(value = '') {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
