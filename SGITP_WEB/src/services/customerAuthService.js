const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export async function loginCustomer(credentials) {
  let response;

  try {
    response = await fetch(`${API_URL}/loginCustomer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend este encendido.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 503) {
      throw new Error('La base de datos no esta conectada. Revisa MONGODB_URI en el backend.');
    }

    throw new Error(data.message ?? 'Login failed');
  }

  return data;
}

export async function logoutCustomer() {
  let response;

  try {
    response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend este encendido.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? 'Logout failed');
  }

  return data;
}
