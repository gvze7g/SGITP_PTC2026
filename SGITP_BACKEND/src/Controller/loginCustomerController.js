import bcrypt from "bcryptjs";
import customerModel from "../Model/customer.js";
import {
  createSessionToken,
  publicCustomer,
  setSessionCookie,
} from "../utils/sessionToken.js";

const loginCustomerController = {};

loginCustomerController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar cliente por correo
    const userFound = await customerModel.findOne({ email });

    if (!userFound) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Si la cuenta está bloqueada por intentos fallidos, no deja entrar
    if (userFound.timeOut && userFound.timeOut > Date.now()) {
      return res.status(403).json({ message: "Cuenta bloqueada temporalmente" });
    }

    // Cuenta creada únicamente con Google: no tiene contraseña local que comparar
    if (!userFound.password) {
      return res.status(400).json({
        message: "Esta cuenta fue creada con Google. Usa 'Continuar con Google' para iniciar sesión.",
      });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      // Sumar intentos fallidos
      userFound.loginAttempts = (userFound.loginAttempts || 0) + 1;

      // Al llegar a 5 intentos, bloquea 15 minutos
      if (userFound.loginAttempts >= 5) {
        userFound.timeOut = Date.now() + 15 * 60 * 1000;
        userFound.loginAttempts = 0;

        await userFound.save();
        return res.status(403).json({ message: "Cuenta bloqueada" });
      }

      await userFound.save();
      return res.status(403).json({ message: "Contraseña incorrecta" });
    }

    // Si la contraseña es correcta, limpia intentos y desbloquea
    userFound.loginAttempts = 0;
    userFound.timeOut = null;
    await userFound.save();

    // Crear token con datos básicos del cliente y guardarlo en cookie segura
    const token = createSessionToken(userFound);
    setSessionCookie(res, token);

    return res.status(200).json({
      message: "Login exitoso",
      // La web usa la cookie e ignora este token; la app móvil lo guarda en
      // SecureStore porque React Native no persiste cookies de forma confiable.
      token,
      user: publicCustomer(userFound),
    });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default loginCustomerController;