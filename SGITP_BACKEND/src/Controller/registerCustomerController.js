import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import customerModel from "../Model/customer.js";
import { config } from "../config.js";

const registerCustomerController = {};

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

    const existCustomer = await customerModel.findOne({ email });
    if (existCustomer) {
      return res.status(400).json({ message: "email already in use" });
    }

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

    const verificationCode = crypto.randomBytes(3).toString("hex");

    const tokenCode = jsonwebtoken.sign(
      { email, verificationCode },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("verificationTokenCookie", tokenCode, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 15 * 60 * 1000,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.user_email,
        pass: config.email.user_password,
      },
    });

    const mailOptions = {
      from: config.email.user_email,
      to: email,
      subject: "Verificación de cuenta",
      text:
        "Para verificar tu cuenta, utiliza este código: " +
        verificationCode +
        " expira en 15 minutos",
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log("error " + error);
        return res.status(500).json({ message: "error" });
      }

      return res.status(200).json({ message: "email send" });
    });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

registerCustomerController.verifyCode = async (req, res) => {
  try {
    const { verificationCodeRequest } = req.body;
    const token = req.cookies.verificationTokenCookie;

    if (!token) {
      return res.status(401).json({ message: "Token missing or expired" });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const { email, verificationCode: storedCode } = decoded;

    if (verificationCodeRequest !== storedCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    await customerModel.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    res.clearCookie("verificationTokenCookie");

    return res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerCustomerController;