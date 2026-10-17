import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import customerModel from "../Model/customer.js";
import { config } from "../config.js";
import { sendEmail } from "../utils/sendMailjet.js";
import HTMLVerificationEmail from "../utils/sendMailVerification.js";
import { getAuthCookieOptions, getClearCookieOptions } from "../utils/cookieOptions.js";
import { PASSWORD_MIN_LENGTH, isValidEmail, isValidName } from "../utils/validators.js";

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
    } = req.body;

    // Limpieza básica de texto
    full_name = full_name?.trim();
    email = email?.trim();

    // El registro público siempre crea clientes minoristas. Solo un empleado
    // puede volver mayorista a un cliente desde el panel (PUT /customer/:id);
    // si se aceptara del body, cualquiera se registraría como mayorista para
    // ver el stock y pagar el precio mayorista.
    if (customer_type !== undefined && !ALLOWED_CUSTOMER_TYPES.includes(String(customer_type).trim())) {
      return res.status(400).json({ message: "Tipo de cliente inválido" });
    }
    customer_type = "Client";

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios" });
    }

    if (!isValidName(full_name)) {
      return res
        .status(400)
        .json({ message: "El nombre debe tener entre 3 y 50 letras, sin números ni símbolos" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Correo electrónico inválido" });
    }

    if (String(password).length < PASSWORD_MIN_LENGTH) {
      return res
        .status(400)
        .json({ message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres` });
    }

    // Evita registrar correos repetidos. Si la cuenta existe pero nunca se
    // verificó (el código venció), se deja registrar de nuevo y se manda un
    // código nuevo; si no, esa persona quedaría bloqueada para siempre ahora
    // que el login exige el correo verificado.
    const existCustomer = await customerModel.findOne({ email });
    if (existCustomer && existCustomer.isVerified !== false) {
      return res.status(400).json({ message: "Este correo ya está registrado" });
    }

    // Encripta contraseña antes de guardar
    const passwordHash = await bcryptjs.hash(password, 10);

    if (existCustomer) {
      await customerModel.deleteOne({ _id: existCustomer._id, isVerified: false });
    }

    const newCustomer = new customerModel({
      customer_type,
      full_name,
      main_phone,
      email,
      password: passwordHash,
      addresses,
      phone_numbers,
      // La cuenta solo se verifica con el código del correo; no se acepta
      // isVerified/loginAttempts/timeOut desde el body.
      isVerified: false,
      loginAttempts: 0,
      timeOut: null,
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
    res.cookie("verificationTokenCookie", tokenCode, getAuthCookieOptions(15 * 60 * 1000));

    // Configurar y enviar correo con el código
    const htmlContent = HTMLVerificationEmail(verificationCode);

    await sendEmail(email, "Verificación de cuenta", htmlContent);

    return res.status(200).json({ message: "Te enviamos un código a tu correo" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

registerCustomerController.verifyCode = async (req, res) => {
  try {
    const { verificationCodeRequest } = req.body;
    const token = req.cookies.verificationTokenCookie;

    // Verifica que exista token de verificación
    if (!token) {
      return res.status(401).json({ message: "El código expiró, solicita uno nuevo" });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const { email, verificationCode: storedCode } = decoded;

    // Compara código enviado por usuario vs código guardado
    if (verificationCodeRequest !== storedCode) {
      return res.status(400).json({ message: "El código ingresado no es válido" });
    }

    // Si el código es correcto, activa la cuenta
    await customerModel.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // Borra cookie de verificación al finalizar
    res.clearCookie("verificationTokenCookie", getClearCookieOptions());

    return res.status(200).json({ message: "Cuenta verificada correctamente" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default registerCustomerController;