const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

// Centraliza el carrito publico para que agregar, editar, borrar y listar productos
// siempre use la sesion del cliente guardada por el backend.
async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? fallbackMessage);
  }

  return data;
}

export async function getMyCart() {
  let response;

  try {
    response = await fetch(`${API_URL}/cart/mine`, {
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudo cargar el carrito.');
}

// size/color identifican la variante: el stock se lleva por talla y color.
export async function addItemToCart(productId, quantity = 1, { size, color } = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}/cart/mine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId, quantity, size, color }),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudo agregar el producto al carrito.');
}

// itemId es el _id de la linea del carrito (una por talla/color).
export async function updateCartItem(itemId, quantity) {
  let response;

  try {
    response = await fetch(`${API_URL}/cart/mine/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ quantity }),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudo actualizar el carrito.');
}

export async function removeCartItem(itemId) {
  let response;

  try {
    response = await fetch(`${API_URL}/cart/mine/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudo eliminar el producto.');
}

export async function placeCartOrder(orderData) {
  let response;

  try {
    response = await fetch(`${API_URL}/cart/mine/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(orderData),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudo realizar el pedido.');
}

export async function getMyOrders() {
  let response;

  try {
    response = await fetch(`${API_URL}/sales/mine`, {
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudo cargar el historial de pedidos.');
}
