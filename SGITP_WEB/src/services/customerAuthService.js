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
    throw new Error('Backend connection failed');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? 'Login failed');
  }

  return data;
}
