// URL del backend.
//
// El celular no puede usar "localhost": eso apuntaria al propio telefono.
// Hay que usar la IP de tu computadora en la red WiFi (la misma que aparece
// cuando arranca Expo, ej: exp://192.168.0.20:8081).
//
// Lo correcto es ponerla en el archivo .env de SGITP_MOVIL:
//   EXPO_PUBLIC_API_URL=http://192.168.0.20:4000/api
// y reiniciar con: npx expo start -c
//
// El valor de abajo solo se usa si no existe esa variable, para que el
// proyecto siga arrancando en la maquina de quien no haya creado el .env.
const FALLBACK_API_URL = 'http://10.29.124.170:4000/api';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || FALLBACK_API_URL;

// Client IDs de Google. Google entrega uno distinto por plataforma y hay que
// mandar el que corresponde al dispositivo donde corre la app.
// Se sacan de Google Cloud Console (ver GUIA_LOGIN_SOCIAL.md).
export const GOOGLE_CLIENT_IDS = {
  expo: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_EXPO,
  ios: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
  android: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
};
