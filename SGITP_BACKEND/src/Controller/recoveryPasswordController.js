import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";

import employeeModel from "../Model/employee.js";
import customerModel from "../Model/customer.js";
import { config } from "../config.js";
import { sendEmail } from "../utils/sendMailjet.js";
import HTMLRecoveryEmail from "../utils/sendMailRecoveryPassword.js";
import { getAuthCookieOptions, getClearCookieOptions } from "../utils/cookieOptions.js";

const recoveryPasswordController = {};

recoveryPasswordController.sendRecoveryCode = async (req, res) => {
  try {
    const { email, userType } = req.body;

    let userFound = null;

    // Buscar usuario según su tipo (empleado o cliente)
    if (userType === "Employee") {
      userFound = await employeeModel.findOne({ email });
    } else if (userType === "Customer") {
      userFound = await customerModel.findOne({ email });
    } else {
      return res.status(400).json({ message: "Tipo de usuario inválido" });
    }

    if (!userFound) {
      return res.status(404).json({ message: "No existe una cuenta con ese correo" });
    }

    // Generar código aleatorio de recuperación
    const randomCode = crypto.randomBytes(3).toString("hex");

    // Guardar código y datos en token temporal (15 min)
    const token = jsonwebtoken.sign(
      { email, randomCode, userType, verified: false },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("recoveryCookie", token, getAuthCookieOptions(15 * 60 * 1000));

    // Enviar correo con el código
    const htmlContent = HTMLRecoveryEmail(randomCode);

    await sendEmail(email, "Código de recuperación de contraseña", htmlContent);

    return res.status(200).json({ message: "Te enviamos un código de recuperación a tu correo" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

recoveryPasswordController.verifyCode = async (req, res) => {
  try {
    const { code } = req.body;
    const token = req.cookies.recoveryCookie;

    // Verifica que exista token de recuperación
    if (!token) {
      return res.status(401).json({ message: "El código expiró, solicita uno nuevo" });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    // Compara código recibido con el guardado
    if (code !== decoded.randomCode) {
      return res.status(400).json({ message: "El código ingresado no es válido" });
    }

    // Si es correcto, crea nuevo token marcado como "verified"
    const newToken = jsonwebtoken.sign(
      { email: decoded.email, userType: decoded.userType, verified: true },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("recoveryCookie", newToken, getAuthCookieOptions(15 * 60 * 1000));

    return res.status(200).json({ message: "Código verificado correctamente" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

recoveryPasswordController.newPassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;

    if (!newPassword || String(newPassword).length < 8) {
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 8 caracteres" });
    }

    // Validar que ambas contraseñas coincidan
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    const token = req.cookies.recoveryCookie;

    if (!token) {
      return res.status(401).json({ message: "El código expiró, solicita uno nuevo" });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    // Solo permite cambiar contraseña si ya verificó el código
    if (!decoded.verified) {
      return res.status(400).json({ message: "Primero debes verificar el código" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Actualiza contraseña según el tipo de usuario
    if (decoded.userType === "Employee") {
      await employeeModel.findOneAndUpdate(
        { email: decoded.email },
        {
          password: passwordHash,
          loginAttempts: 0,
          timeOut: null,
        }
      );
    } else if (decoded.userType === "Customer") {
      await customerModel.findOneAndUpdate(
        { email: decoded.email },
        {
          password: passwordHash,
          loginAttempts: 0,
          timeOut: null,
        }
      );
    } else {
      return res.status(400).json({ message: "Tipo de usuario inválido" });
    }

    // Limpia cookie de recuperación al finalizar
    res.clearCookie("recoveryCookie", getClearCookieOptions());

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default recoveryPasswordController;