import { OAuth2Client } from "google-auth-library";
import customerModel from "../Model/customer.js";
import { config } from "../config.js";
import {
  createSessionToken,
  publicCustomer,
  setSessionCookie,
} from "../utils/sessionToken.js";

const googleAuthController = {};

// Google firma el id_token con el client ID de la plataforma desde la que se
// inicio sesion: web, iOS, Android y Expo Go tienen client IDs distintos.
// Si aqui solo se acepta el de la web, el login desde el celular siempre
// respondera "Token de Google invalido o expirado".
const getAllowedAudiences = () =>
  [
    config.google.client_id,
    config.google.ios_client_id,
    config.google.android_client_id,
    config.google.expo_client_id,
  ].filter(Boolean);

const client = new OAuth2Client();

googleAuthController.google = async (req, res) => {
  try {
    const allowedAudiences = getAllowedAudiences();

    if (allowedAudiences.length === 0) {
      return res.status(500).json({
        message:
          "Google Sign-In no esta configurado en el servidor. Falta GOOGLE_CLIENT_ID en el .env del backend.",
      });
    }

    // La web manda "credential" (Google Identity Services) y la app movil
    // manda "idToken" (expo-auth-session). Se aceptan los dos nombres.
    const credential = req.body?.credential || req.body?.idToken;

    if (!credential) {
      return res.status(400).json({ message: "Falta el credential de Google" });
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: allowedAudiences,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.log("google verify error: " + verifyError);
      return res
        .status(401)
        .json({ message: "Token de Google invalido o expirado" });
    }

    if (!payload?.email) {
      return res
        .status(400)
        .json({ message: "Google no proporciono un correo" });
    }

    if (!payload.email_verified) {
      return res
        .status(403)
        .json({ message: "Tu correo de Google no esta verificado" });
    }

    let userFound = await customerModel.findOne({ email: payload.email });

    if (userFound) {
      // Cuenta bloqueada por intentos fallidos de login local: respeta el mismo bloqueo
      if (userFound.timeOut && userFound.timeOut > Date.now()) {
        return res
          .status(403)
          .json({ message: "Cuenta bloqueada temporalmente" });
      }

      // Vincula la cuenta local existente con Google la primera vez que se usa
      if (!userFound.googleId) {
        userFound.googleId = payload.sub;
        if (!userFound.profileImage && payload.picture) {
          userFound.profileImage = payload.picture;
        }
        userFound.isVerified = true;
        userFound.loginAttempts = 0;
        userFound.timeOut = null;
        await userFound.save();
      }
    } else {
      // No existe la cuenta: se crea usando unicamente los datos autorizados por Google
      userFound = await customerModel.create({
        full_name: payload.name || payload.email,
        email: payload.email,
        provider: "google",
        googleId: payload.sub,
        profileImage: payload.picture,
        isVerified: true,
        customer_type: "Client",
      });
    }

    const token = createSessionToken(userFound);
    setSessionCookie(res, token);

    return res.status(200).json({
      message: "Login con Google exitoso",
      // La web usa la cookie e ignora este token; la app movil lo guarda
      // en SecureStore porque no puede depender de cookies.
      token,
      user: publicCustomer(userFound),
    });
  } catch (error) {
    console.log("google auth error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default googleAuthController;
