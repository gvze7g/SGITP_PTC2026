import jsonwebtoken from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import customerModel from "../Model/customer.js";
import { config } from "../config.js";

const googleAuthController = {};

const client = new OAuth2Client(config.google.client_id);

googleAuthController.google = async (req, res) => {
  try {
    if (!config.google.client_id) {
      return res
        .status(500)
        .json({ message: "Google Sign-In no está configurado en el servidor" });
    }

    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Falta el credential de Google" });
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: config.google.client_id,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.log("google verify error: " + verifyError);
      return res.status(401).json({ message: "Token de Google inválido o expirado" });
    }

    if (!payload?.email) {
      return res.status(400).json({ message: "Google no proporcionó un correo" });
    }

    if (!payload.email_verified) {
      return res.status(403).json({ message: "Tu correo de Google no está verificado" });
    }

    let userFound = await customerModel.findOne({ email: payload.email });

    if (userFound) {
      // Cuenta bloqueada por intentos fallidos de login local, respeta el mismo bloqueo
      if (userFound.timeOut && userFound.timeOut > Date.now()) {
        return res.status(403).json({ message: "Cuenta bloqueada temporalmente" });
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
      // No existe la cuenta: se crea usando únicamente los datos autorizados por Google
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

    const token = jsonwebtoken.sign(
      {
        id: userFound._id,
        userType: "Customer",
        customerType: userFound.customer_type,
      },
      config.JWT.secret,
      { expiresIn: "30d" }
    );

    res.cookie("authCookie", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login con Google exitoso",
      user: {
        id: userFound._id,
        full_name: userFound.full_name,
        email: userFound.email,
        customer_type: userFound.customer_type,
        profileImage: userFound.profileImage,
      },
    });
  } catch (error) {
    console.log("google auth error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default googleAuthController;
