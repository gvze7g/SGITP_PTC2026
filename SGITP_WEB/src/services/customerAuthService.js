const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export async function getCurrentCustomer() {
  let response;

  try {
    response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend este encendido.');
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error(data.message ?? 'No se pudo obtener la sesion.');
  }

  return ['Customer', 'Employee'].includes(data.userType)
    ? { ...data.user, userType: data.userType }
    : null;
}

export async function registerCustomer(customer) {
  let response;

  try {
    response = await fetch(`${API_URL}/registerCustomer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(customer),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend este encendido.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 500 && data.message === 'error') {
      return data;
    }

    if (response.status === 503) {
      throw new Error('La base de datos no esta conectada. Revisa DB_URI en el backend.');
    }

    throw new Error(data.message ?? 'No se pudo crear la cuenta.');
  }

  return data;
}

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

export async function loginWebUser(credentials) {
  try {
    return await loginCustomer(credentials);
  } catch (customerError) {
    if (!customerError.message?.toLowerCase().includes('customer not found')) {
      throw customerError;
    }
  }

  let response;

  try {
    response = await fetch(`${API_URL}/loginEmployee`, {
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
    throw new Error(data.message ?? 'No se pudo iniciar sesion.');
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

async function parseCustomerResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? fallbackMessage);
  }

  return data;
}

export async function addCustomerAddress(address) {
  let response;

  try {
    response = await fetch(`${API_URL}/customer/me/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(address),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend este encendido.');
  }

  return parseCustomerResponse(response, 'No se pudo guardar la direccion.');
}

export async function updateCustomerAddress(addressId, address) {
  let response;

  try {
    response = await fetch(`${API_URL}/customer/me/addresses/${addressId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(address),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend este encendido.');
  }

  return parseCustomerResponse(response, 'No se pudo actualizar la direccion.');
}

export async function deleteCustomerAddress(addressId) {
  let response;

  try {
    response = await fetch(`${API_URL}/customer/me/addresses/${addressId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend este encendido.');
  }

  return parseCustomerResponse(response, 'No se pudo eliminar la direccion.');
}
