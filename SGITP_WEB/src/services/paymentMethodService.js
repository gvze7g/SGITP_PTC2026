const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? fallbackMessage);
  }

  return data;
}

async function send(path, options, fallbackMessage) {
  let response;

  try {
    response = await fetch(`${API_URL}/paymentMethod${path}`, {
      credentials: 'include',
      ...options,
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.', {
      cause: error,
    });
  }

  return parseResponse(response, fallbackMessage);
}

// Detecta la marca por el primer digito (misma regla que la app movil). El
// numero completo nunca sale del navegador: al backend solo viajan la marca
// y los ultimos 4 digitos (ver Model/paymentMethod.js).
export function getCardBrand(cardNumber = '') {
  if (cardNumber.startsWith('4')) return 'Visa';
  if (cardNumber.startsWith('5')) return 'Mastercard';
  return 'Otra';
}

export function getMyCards() {
  return send('/mine', {}, 'No se pudieron obtener tus tarjetas.');
}

export function addMyCard({ cardNumber, expiry, holderName, isPrimary = false }) {
  const [expiry_month, expiry_year] = expiry.split('/');

  return send(
    '/mine',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand: getCardBrand(cardNumber),
        last4: cardNumber.slice(-4),
        expiry_month,
        expiry_year,
        holder_name: holderName.trim(),
        isPrimary,
      }),
    },
    'No se pudo guardar la tarjeta.'
  );
}

export function setPrimaryCard(cardId) {
  return send(
    `/mine/${cardId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPrimary: true }),
    },
    'No se pudo actualizar la tarjeta.'
  );
}

export function removeMyCard(cardId) {
  return send(`/mine/${cardId}`, { method: 'DELETE' }, 'No se pudo eliminar la tarjeta.');
}
