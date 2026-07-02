import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";

import employeeModel from "../Model/employee.js";
import customerModel from "../Model/customer.js";
import { config } from "../config.js";

const recoveryPasswordController = {};

const HTMLRecoveryEmail = (code) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Código de recuperación</h2>
      <p>Tu código de recuperación es:</p>
      <h1 style="letter-spacing: 4px;">${code}</h1>
      <p>Este código vence en 15 minutos.</p>
    </div>
  `;
};

recoveryPasswordController.sendRecoveryCode = async (req, res) => {
  try {
    const { email, userType } = req.body;

    let userFound = null;

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

    const randomCode = crypto.randomBytes(3).toString("hex");

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
      subject: "Código de recuperación de contraseña",
      text: "Tu código es: " + randomCode + ". Vence en 15 minutos.",
      html: HTMLRecoveryEmail(randomCode),
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log("Error nodemailer:", error);
        return res.status(500).json({ message: "Error al enviar correo" });
      }
    });

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

    if (!token) {
      return res.status(401).json({ message: "Token missing or expired" });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    if (code !== decoded.randomCode) {
      return res.status(400).json({ message: "Invalid code" });
    }

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

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }

    const token = req.cookies.recoveryCookie;

    if (!token) {
      return res.status(401).json({ message: "Token missing or expired" });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    if (!decoded.verified) {
      return res.status(400).json({ message: "Code not verified" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

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

    res.clearCookie("recoveryCookie");

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default recoveryPasswordController;