import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import customerModel from "../Model/customer.js";
import { config } from "../config.js";
import { getAuthCookieOptions } from "../utils/cookieOptions.js";

const loginCustomerController = {};

loginCustomerController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar cliente por correo
    const userFound = await customerModel.findOne({ email });

    if (!userFound) {
      return res.status(404).json({ message: "No encontramos una cuenta con ese correo" });
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

    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "La contraseña es obligatoria" });
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

    // Sin verificar el correo no hay sesión: antes se podía comprar con una
    // cuenta cuyo correo nunca se confirmó.
    if (userFound.isVerified === false) {
      return res.status(403).json({
        message:
          "Debes verificar tu correo antes de iniciar sesión. Regístrate de nuevo con este correo para recibir un código nuevo.",
      });
    }

    // Si la contraseña es correcta, limpia intentos y desbloquea
    userFound.loginAttempts = 0;
    userFound.timeOut = null;
    await userFound.save();

    // Crear token con datos básicos del cliente
    const token = jsonwebtoken.sign(
      {
        id: userFound._id,
        userType: "Customer",
        customerType: userFound.customer_type,
      },
      config.JWT.secret,
      { expiresIn: "30d" }
    );

    // Guardar token en cookie segura para sesión
    res.cookie("authCookie", token, getAuthCookieOptions(30 * 24 * 60 * 60 * 1000));

    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: userFound._id,
        full_name: userFound.full_name,
        email: userFound.email,
        customer_type: userFound.customer_type,
      },
    });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default loginCustomerController;