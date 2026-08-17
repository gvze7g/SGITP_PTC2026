import * as SecureStore from 'expo-secure-store';

// React Native no guarda cookies de forma confiable: al cerrar y volver a
// abrir la app la cookie de sesion se puede perder. Por eso el backend, ademas
// de mandar la cookie (que usa la web), devuelve el token en el body y aqui lo
// guardamos en el almacenamiento seguro del telefono.
const TOKEN_KEY = 'sgitp_auth_token';

// Copia en memoria para no ir al almacenamiento seguro en cada peticion.
let cachedToken = null;

export const sessionStore = {
  async getToken() {
    if (cachedToken !== null) return cachedToken;

    try {
      cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      cachedToken = null;
    }

    return cachedToken;
  },

  async setToken(token) {
    cachedToken = token ?? null;

    try {
      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch {
      // Si el telefono no deja escribir en SecureStore, al menos la sesion
      // sigue funcionando mientras la app este abierta (cachedToken).
    }
  },

  async clear() {
    await this.setToken(null);
  },
};
