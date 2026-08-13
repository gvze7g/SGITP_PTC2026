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

export async function addItemToCart(productId, quantity = 1) {
  let response;

  try {
    response = await fetch(`${API_URL}/cart/mine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId, quantity }),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudo agregar el producto al carrito.');
}

export async function updateCartItem(productId, quantity) {
  let response;

  try {
    response = await fetch(`${API_URL}/cart/mine/${productId}`, {
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

export async function removeCartItem(productId) {
  let response;

  try {
    response = await fetch(`${API_URL}/cart/mine/${productId}`, {
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
