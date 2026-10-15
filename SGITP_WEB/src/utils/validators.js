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

// Cada marca tiene sus propios prefijos (IIN, los primeros digitos) y largos
// permitidos; ademas todo numero real cumple el algoritmo de Luhn (el ultimo
// digito es de control). Asi se rechazan numeros inventados o mal escritos.
// Esto no confirma que la tarjeta exista, solo que el numero es posible.
export const CARD_BRAND_RULES = [
  { name: 'American Express', prefixes: [[34], [37]], lengths: [15], cvv: 4 },
  { name: 'Visa', prefixes: [[4]], lengths: [13, 16, 19], cvv: 3 },
  { name: 'Mastercard', prefixes: [[51, 55], [2221, 2720]], lengths: [16], cvv: 3 },
  {
    name: 'Discover',
    prefixes: [[6011], [644, 649], [65], [622126, 622925]],
    lengths: [16, 17, 18, 19],
    cvv: 3,
  },
  { name: 'Diners Club', prefixes: [[300, 305], [36], [38, 39]], lengths: [14, 15, 16, 17, 18, 19], cvv: 3 },
  { name: 'JCB', prefixes: [[3528, 3589]], lengths: [16, 17, 18, 19], cvv: 3 },
  { name: 'UnionPay', prefixes: [[62]], lengths: [16, 17, 18, 19], cvv: 3 },
];

function matchesPrefix(digits, [from, to = from]) {
  const size = String(from).length;
  const start = Number(digits.slice(0, size));
  return digits.length >= size && start >= from && start <= to;
}

// Devuelve la regla de la marca segun los primeros digitos, o null si no
// corresponde a ninguna.
export function detectCardBrand(value = '') {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return null;
  return CARD_BRAND_RULES.find((rule) => rule.prefixes.some((range) => matchesPrefix(digits, range))) || null;
}

export function passesLuhn(digits = '') {
  let sum = 0;
  let double = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }

  return digits.length > 0 && sum % 10 === 0;
}

// Mensaje de error para el numero de tarjeta, o '' si es valido.
export function getCardNumberError(value = '') {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return 'Ingresa el numero de tarjeta.';

  const brand = detectCardBrand(digits);
  if (!brand) return 'El numero no corresponde a Visa, Mastercard, American Express, Discover, Diners Club, JCB ni UnionPay.';

  if (!brand.lengths.includes(digits.length)) {
    const first = brand.lengths[0];
    const last = brand.lengths[brand.lengths.length - 1];
    const isRange = brand.lengths.length > 2 && last - first + 1 === brand.lengths.length;
    const lengths = isRange
      ? `entre ${first} y ${last}`
      : `${brand.lengths.slice(0, -1).join(', ')}${brand.lengths.length > 1 ? ' o ' : ''}${last}`;
    return `Una tarjeta ${brand.name} debe tener ${lengths} digitos.`;
  }

  if (!passesLuhn(digits)) return 'El numero de tarjeta no es valido. Revisa que este bien escrito.';
  return '';
}

export function isValidCardNumber(value = '') {
  return getCardNumberError(value) === '';
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

// American Express usa 4 digitos; las demas marcas conocidas usan 3. Si la
// marca no se conoce (tarjetas guardadas como "Otra") se acepta 3 o 4.
export function getCvvLength(brand) {
  if (brand === 'American Express') return { min: 4, max: 4 };
  const rule = CARD_BRAND_RULES.find((item) => item.name === brand);
  return rule ? { min: rule.cvv, max: rule.cvv } : { min: 3, max: 4 };
}

export function isValidCvv(value = '', brand) {
  const { min, max } = getCvvLength(brand);
  return /^\d+$/.test(value) && value.length >= min && value.length <= max;
}
