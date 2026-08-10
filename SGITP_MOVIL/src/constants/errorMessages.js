// El backend a veces responde en inglés y a veces en español (no es
// consistente). Para que el usuario SIEMPRE vea español en la app, acá
// traducimos los mensajes que ya conocemos. Si llega uno que no está en
// esta lista, se muestra un mensaje genérico en español (ver authService.js).
export const BACKEND_MESSAGE_TRANSLATIONS = {
  'Customer not found': 'No encontramos una cuenta con ese correo',
  'User not found': 'No encontramos una cuenta con ese correo',
  'Employee not found': 'No encontramos una cuenta con ese correo',
  'Invalid user type': 'Tipo de usuario inválido',
  'Invalid customer type': 'Tipo de cliente inválido',
  'email already in use': 'Este correo ya está registrado',
  'Token missing or expired': 'El código expiró, solicita uno nuevo',
  'Invalid verification code': 'El código ingresado no es válido',
  'Invalid code': 'El código ingresado no es válido',
  'Code not verified': 'Primero debes verificar el código',
  "Passwords don't match": 'Las contraseñas no coinciden',
  'Internal server error': 'Ocurrió un error en el servidor, intenta de nuevo',
};

const FALLBACK_MESSAGE = 'Ocurrió un error inesperado, intenta de nuevo';

// Si el mensaje está en la lista de arriba, lo traduce. Si no está pero sí
// llegó algo del backend (ej. ya viene en español), lo deja tal cual.
// Solo usa el mensaje genérico cuando no llegó nada.
export function translateBackendMessage(message) {
  return BACKEND_MESSAGE_TRANSLATIONS[message] || message || FALLBACK_MESSAGE;
}
