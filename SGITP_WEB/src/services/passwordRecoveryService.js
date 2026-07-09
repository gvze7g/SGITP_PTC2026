const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const RECOVERY_URL = `${API_URL}/recoveryPassword`;

const recoveryMessages = {
  'Invalid user type': 'Tipo de usuario invalido.',
  'User not found': 'No existe una cuenta con ese correo.',
  'Error al enviar correo': 'No se pudo enviar el correo de recuperacion.',
  'Token missing or expired': 'El codigo expiro. Solicita uno nuevo.',
  'Invalid code': 'El codigo ingresado no es valido.',
  'Code not verified': 'Primero debes verificar el codigo.',
  "Passwords don't match": 'Las contrasenas no coinciden.',
  'Internal server error': 'Ocurrio un error en el servidor.',
};

async function recoveryRequest(path, payload) {
  let response;

  try {
    response = await fetch(`${RECOVERY_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend este encendido.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(recoveryMessages[data.message] ?? data.message ?? 'No se pudo completar la solicitud.');
  }

  return data;
}

export function requestCustomerRecoveryCode(email) {
  return recoveryRequest('/requestCode', {
    email,
    userType: 'Customer',
  });
}

export function verifyCustomerRecoveryCode(code) {
  return recoveryRequest('/verifyCode', { code });
}

export function updateCustomerPassword(newPassword, confirmNewPassword) {
  return recoveryRequest('/newPassword', {
    newPassword,
    confirmNewPassword,
  });
}
