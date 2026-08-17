import dotenv from "dotenv";

dotenv.config();

export const config = {
  db: {
    URI: process.env.DB_URI,
    dnsServers: process.env.DNS_SERVERS?.split(",")
      .map((server) => server.trim())
      .filter(Boolean),
  },
  server: {
    port: process.env.PORT,
  },
  JWT: {
    secret: process.env.JWT_SECRET_KEY,
  },
  email: {
    user_email: process.env.USER_EMAIL,
    user_password: process.env.USER_PASSWORD,
  },
  cloudinary: {
    cloudinary_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  wompi: {
    grant_type: process.env.GRANT_TYPE,
    audience: process.env.AUDIENCE,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  },
  // Viene de develop: envio de correos con Mailjet
  mailjet: {
    apiKey: process.env.API_KEY_MAILJET,
    secretKey: process.env.API_SECRET_MAILJET,
    fromEmail: process.env.MAILJET_FROM_EMAIL,
    fromName: process.env.MAILJET_FROM_NAME,
  },
  // Viene de main: login con Google
  google: {
    // Client ID de la web (el que usa SGITP_WEB con Google Identity Services).
    client_id: process.env.GOOGLE_CLIENT_ID,
    // Google emite un token distinto por plataforma, y cada uno viene firmado
    // para su propio client ID. El backend tiene que aceptar los tres o el
    // login desde el celular fallara con "Token de Google invalido".
    ios_client_id: process.env.GOOGLE_CLIENT_ID_IOS,
    android_client_id: process.env.GOOGLE_CLIENT_ID_ANDROID,
    expo_client_id: process.env.GOOGLE_CLIENT_ID_EXPO,
  },
  apple: {
    // Service ID (com.peques.web) para el login desde la web y Bundle ID
    // (com.peques.movil) para el de la app. Igual que Google: se aceptan varios.
    client_ids: (process.env.APPLE_CLIENT_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  },
  cookie: {
    // En local el frontend y el backend van por http, asi que secure debe ser
    // false. En produccion (https) tiene que ser true y sameSite "none" para
    // que la cookie viaje entre dominios distintos.
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
  },
};

