import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import customerModel from "../Model/customer.js";
import { config } from "../config.js";
import {
  createSessionToken,
  publicCustomer,
  setSessionCookie,
} from "../utils/sessionToken.js";

const appleAuthController = {};

const APPLE_ISSUER = "https://appleid.apple.com";
const APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys";

// Apple publica sus llaves publicas y las rota cada cierto tiempo. Se guardan
// en memoria por 24 h para no pedirlas en cada login, pero se vuelven a pedir
// si llega un token firmado con una llave (kid) que todavia no conocemos.
let cachedKeys = null;
let cachedKeysAt = 0;
const KEYS_TTL_MS = 24 * 60 * 60 * 1000;

const fetchAppleKeys = async (forceRefresh = false) => {
  const isCacheValid =
    cachedKeys && !forceRefresh && Date.now() - cachedKeysAt < KEYS_TTL_MS;

  if (isCacheValid) return cachedKeys;

  const response = await fetch(APPLE_KEYS_URL);

  if (!response.ok) {
    throw new Error("No se pudieron obtener las llaves publicas de Apple");
  }

  const data = await response.json();

  cachedKeys = data.keys || [];
  cachedKeysAt = Date.now();

  return cachedKeys;
};

// Busca la llave con la que Apple firmo este token y la convierte al formato
// PEM que entiende jsonwebtoken.
const getApplePublicKey = async (kid) => {
  let keys = await fetchAppleKeys();
  let jwk = keys.find((key) => key.kid === kid);

  // Si no aparece, es probable que Apple haya rotado las llaves: se reintenta
  // una vez ignorando el cache antes de dar el token por invalido.
  if (!jwk) {
    keys = await fetchAppleKeys(true);
    jwk = keys.find((key) => key.kid === kid);
  }

  if (!jwk) return null;

  return crypto.createPublicKey({ key: jwk, format: "jwk" }).export({
    type: "spki",
    format: "pem",
  });
};

// Verifica el identity token de Apple: firma, emisor, audiencia y expiracion.
const verifyAppleIdentityToken = async (identityToken, allowedAudiences) => {
  const decoded = jsonwebtoken.decode(identityToken, { complete: true });

  if (!decoded?.header?.kid) {
    throw new Error("El token de Apple no tiene un formato valido");
  }

  const publicKey = await getApplePublicKey(decoded.header.kid);

  if (!publicKey) {
    throw new Error("No se encontro la llave publica de Apple para este token");
  }

  return jsonwebtoken.verify(identityToken, publicKey, {
    algorithms: ["RS256"],
    issuer: APPLE_ISSUER,
    audience: allowedAudiences,
  });
};

appleAuthController.apple = async (req, res) => {
  try {
    const allowedAudiences = config.apple.client_ids;

    if (allowedAudiences.length === 0) {
      return res.status(500).json({
        message:
          "Sign in with Apple no esta configurado en el servidor. Falta APPLE_CLIENT_IDS en el .env del backend.",
      });
    }

    // La web (Apple JS SDK) manda authorization.id_token y la app movil
    // (expo-apple-authentication) manda identityToken.
    const identityToken =
      req.body?.identityToken ||
      req.body?.id_token ||
      req.body?.authorization?.id_token;

    if (!identityToken) {
      return res
        .status(400)
        .json({ message: "Falta el identityToken de Apple" });
    }

    let payload;
    try {
      payload = await verifyAppleIdentityToken(identityToken, allowedAudiences);
    } catch (verifyError) {
      console.log("apple verify error: " + verifyError);
      return res
        .status(401)
        .json({ message: "Token de Apple invalido o expirado" });
    }

    // "sub" es el identificador estable del usuario en Apple. El correo solo
    // viene la PRIMERA vez que el usuario autoriza la app, por eso hay que
    // buscar tambien por appleId y no depender unicamente del email.
    const appleId = payload.sub;
    const email = payload.email;

    if (!appleId) {
      return res.status(400).json({ message: "Apple no proporciono un usuario" });
    }

    let userFound = await customerModel.findOne({ appleId });

    // Si no lo encontramos por appleId pero Apple nos dio correo, puede ser una
    // cuenta que ya existia (creada con contrasena o con Google): se vinculan.
    if (!userFound && email) {
      userFound = await customerModel.findOne({ email });
    }

    if (userFound) {
      if (userFound.timeOut && userFound.timeOut > Date.now()) {
        return res
          .status(403)
          .json({ message: "Cuenta bloqueada temporalmente" });
      }

      if (!userFound.appleId) {
        userFound.appleId = appleId;
        userFound.isVerified = true;
        userFound.loginAttempts = 0;
        userFound.timeOut = null;
        await userFound.save();
      }
    } else {
      // Apple solo manda el nombre en el primer inicio de sesion y lo hace por
      // fuera del token, en el body. Si no llega, se usa el correo como nombre.
      const fullNameFromClient =
        req.body?.fullName?.givenName || req.body?.fullName?.familyName
          ? [req.body.fullName.givenName, req.body.fullName.familyName]
              .filter(Boolean)
              .join(" ")
          : req.body?.full_name;

      if (!email) {
        return res.status(400).json({
          message:
            "Apple no proporciono un correo. Elimina la app de tu cuenta de Apple (Ajustes > Apple ID > Inicio de sesion con Apple) e intenta de nuevo.",
        });
      }

      userFound = await customerModel.create({
        full_name: fullNameFromClient || email,
        email,
        provider: "apple",
        appleId,
        isVerified: true,
        customer_type: "Client",
      });
    }

    const token = createSessionToken(userFound);
    setSessionCookie(res, token);

    return res.status(200).json({
      message: "Login con Apple exitoso",
      token,
      user: publicCustomer(userFound),
    });
  } catch (error) {
    console.log("apple auth error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default appleAuthController;
