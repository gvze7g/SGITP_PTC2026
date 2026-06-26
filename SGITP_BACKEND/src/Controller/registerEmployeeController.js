import nodemailer from "nodemailer"; //enviar correos
import crypto from "crypto"; //Generar códigos aleatorios
import jsonwebtoken from "jsonwebtoken"; //Generar token
import bcryptjs from "bcryptjs"; //Encriptar contraseña

import employeeModel from "../Model/employee.js";

import { config } from "../config.js";

//Creo un array de funciones
const registerEmployeeController = {};

registerEmployeeController.register = async (req, res) => {
  try {
    //#1 solicitar todos los datos a guardar
    let {
     full_name,
     main_phone,
     email,
     branch_id,
     password,
     addresses,
     phone_numbers,
     birth_date,
     hire_date,
     role,
     isVerified,
     loginAttempts,
     timeOut,
    } = req.body;

    //verificamos si el correo ya está registrado
    const existEmployee = await employeeModel.findOne({ email });
    if (existEmployee) {
      return res.status(400).json({ message: "email already in use" });
    }

    //Encriptar la contraseña
    const passwordHash = await bcryptjs.hash(password, 10);

    //Guardamos todo en la base de datos
    const newEmployee = new employeeModel({
     full_name,
     main_phone,
     email,
     branch_id,
     password: passwordHash,
     addresses,
     phone_numbers,
     birth_date,
     hire_date,
     role,
     isVerified: isVerified || false,
     loginAttempts,
     timeOut,
    });

    await newEmployee.save();

    //Generar código aleatorio
    const verificationCode = crypto.randomBytes(3).toString("hex");

    //Guardamos este código en un token
    const tokenCode = jsonwebtoken.sign(
      //#1- ¿que vamos a guardar?
      { email, verificationCode },
      //#2- secret key
      config.JWT.secret,
      //#3- ¿Cuando expira?
      { expiresIn: "15m" },
    );

    res.cookie("verificationTokenCookie", tokenCode, {
      maxAge: 15 * 60 * 1000,
    });

    //Enviar un correo con el código
    //#1- Transporter -> ¿Quién envía el correo?
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.user_email,
        pass: config.email.user_password,
      },
    });

    //#2- ¿Quién lo va a recibir?
    const mailOptions = {
      from: config.email.user_email,
      to: email,
      subject: "Verificación de cuenta",
      text:
        "Para  verificar tu cuenta, utiliza este código: " +
        verificationCode +
        " expira en 15 minutos",
    };

    //#3- Enviar el correo electrónico
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "error" });
      }

      res.status(200).json({ message: "email send" });
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

registerEmployeeController.verifyCode = async (req, res) => {
  try {
    //#1- Solicitamos el código que el usuario escribió en el frontend
    const { verificationCodeRequest } = req.body;

    //#2- Obtener el token de la cookie
    const token = req.cookies.verificationTokenCookie;

    //#3- Extraer la información del token
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const { email, verificationCode: storedCode } = decoded;

    //#4- Comparo el token que el usuario escribió en el frontend
    //con el que está guardado en el token
    if (verificationCodeRequest !== storedCode) {
      return res.status(400).json({ message: "Invalid code" });
    }

    //Si el código si está bien, entonces, colocamos
    //el campo "isverified" en true
    const employee = await employeeModel.findOne({ email });
    employee.isVerified = true;
    await employee.save();

    res.clearCookie("verificationTokenCookie");

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerEmployeeController;