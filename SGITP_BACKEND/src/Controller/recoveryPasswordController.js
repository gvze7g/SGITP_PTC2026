import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";

import employeeModel from "../Model/employee.js";
import customerModel from "../Model/customer.js";
import { config } from "../config.js";
import { sendEmail } from "../utils/sendMailjet.js";
import HTMLRecoveryEmail from "../utils/sendMailRecoveryPassword.js";

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
      return res.status(400).json({ message: "Invalid user type" });
    }

    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generar código aleatorio de recuperación
    const randomCode = crypto.randomBytes(3).toString("hex");

    // Guardar código y datos en token temporal (15 min)
    const token = jsonwebtoken.sign(
      { email, randomCode, userType, verified: false },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("recoveryCookie", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    // Enviar correo con el código
    const htmlContent = HTMLRecoveryEmail(randomCode);

    await sendEmail(email, "Código de recuperación de contraseña", htmlContent);

    return res.status(200).json({ message: "Recovery email sent" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

recoveryPasswordController.verifyCode = async (req, res) => {
  try {
    const { code } = req.body;
    const token = req.cookies.recoveryCookie;

    // Verifica que exista token de recuperación
    if (!token) {
      return res.status(401).json({ message: "Token missing or expired" });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    // Compara código recibido con el guardado
    if (code !== decoded.randomCode) {
      return res.status(400).json({ message: "Invalid code" });
    }

    // Si es correcto, crea nuevo token marcado como "verified"
    const newToken = jsonwebtoken.sign(
      { email: decoded.email, userType: decoded.userType, verified: true },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("recoveryCookie", newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ message: "Code verified successfully" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

recoveryPasswordController.newPassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;

    // Validar que ambas contraseñas coincidan
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }

    const token = req.cookies.recoveryCookie;

    if (!token) {
      return res.status(401).json({ message: "Token missing or expired" });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    // Solo permite cambiar contraseña si ya verificó el código
    if (!decoded.verified) {
      return res.status(400).json({ message: "Code not verified" });
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
      return res.status(400).json({ message: "Invalid user type" });
    }

    // Limpia cookie de recuperación al finalizar
    res.clearCookie("recoveryCookie");

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default recoveryPasswordController;