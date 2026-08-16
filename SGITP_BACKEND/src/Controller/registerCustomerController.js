import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import customerModel from "../Model/customer.js";
import { config } from "../config.js";
import { sendEmail } from "../utils/sendMailjet.js";
import HTMLVerificationEmail from "../utils/sendMailVerification.js";

const registerCustomerController = {};

// Tipos de cliente permitidos
const ALLOWED_CUSTOMER_TYPES = ["Client", "Wholesale"];

registerCustomerController.register = async (req, res) => {
  try {
    let {
      customer_type,
      full_name,
      main_phone,
      email,
      password,
      addresses,
      phone_numbers,
      isVerified,
      loginAttempts,
      timeOut,
    } = req.body;

    // Limpieza básica de texto
    full_name = full_name?.trim();
    email = email?.trim();

    // Si no envían tipo, por defecto será Client
    customer_type = customer_type?.trim() || "Client";

    if (!ALLOWED_CUSTOMER_TYPES.includes(customer_type)) {
      return res.status(400).json({ message: "Invalid customer type" });
    }

    // Evita registrar correos repetidos
    const existCustomer = await customerModel.findOne({ email });
    if (existCustomer) {
      return res.status(400).json({ message: "email already in use" });
    }

    // Encripta contraseña antes de guardar
    const passwordHash = await bcryptjs.hash(password, 10);

    const newCustomer = new customerModel({
      customer_type,
      full_name,
      main_phone,
      email,
      password: passwordHash,
      addresses,
      phone_numbers,
      isVerified: isVerified || false,
      loginAttempts,
      timeOut,
    });

    await newCustomer.save();

    // Genera código de verificación para email
    const verificationCode = crypto.randomBytes(3).toString("hex");

    const tokenCode = jsonwebtoken.sign(
      { email, verificationCode },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    // Guarda token temporal en cookie (15 min)
    res.cookie("verificationTokenCookie", tokenCode, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    // Configurar y enviar correo con el código
    const htmlContent = HTMLVerificationEmail(verificationCode);

    await sendEmail(email, "Verificación de cuenta", htmlContent);

    return res.status(200).json({ message: "email send" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

registerCustomerController.verifyCode = async (req, res) => {
  try {
    const { verificationCodeRequest } = req.body;
    const token = req.cookies.verificationTokenCookie;

    // Verifica que exista token de verificación
    if (!token) {
      return res.status(401).json({ message: "Token missing or expired" });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const { email, verificationCode: storedCode } = decoded;

    // Compara código enviado por usuario vs código guardado
    if (verificationCodeRequest !== storedCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Si el código es correcto, activa la cuenta
    await customerModel.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // Borra cookie de verificación al finalizar
    res.clearCookie("verificationTokenCookie");

    return res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerCustomerController;