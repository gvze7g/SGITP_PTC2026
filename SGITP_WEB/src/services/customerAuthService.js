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

  // La tienda es solo para clientes: una sesion de empleado (del panel) no
  // cuenta como sesion aqui, porque favoritos, direcciones, tarjetas y
  // pedidos son rutas exclusivas de clientes.
  return data.userType === 'Customer' ? { ...data.user, userType: data.userType } : null;
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

// El codigo se compara contra la cookie temporal que dejo POST /registerCustomer,
// por eso solo se manda el codigo y credentials: 'include'.
export async function verifyCustomerEmail(code) {
  let response;

  try {
    response = await fetch(`${API_URL}/registerCustomer/verifyCodeEmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ verificationCodeRequest: code }),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend este encendido.');
  }

  return parseCustomerResponse(response, 'No se pudo verificar el codigo.');
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

export async function loginWithGoogle(credential) {
  let response;

  try {
    response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential }),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend este encendido.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 503) {
      throw new Error('La base de datos no esta conectada. Intenta mas tarde.');
    }

    throw new Error(data.message ?? 'No se pudo iniciar sesion con Google.');
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

export async function updateCustomerProfile(profile) {
  let response;

  try {
    response = await fetch(`${API_URL}/customer/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profile),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend este encendido.');
  }

  return parseCustomerResponse(response, 'No se pudo actualizar el perfil.');
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
