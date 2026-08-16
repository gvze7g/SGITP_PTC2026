import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import employeeModel from "../Model/employee.js";
import { config } from "../config.js";
import { sendEmail } from "../utils/sendMailjet.js";
import HTMLVerificationEmail from "../utils/sendMailVerification.js";

const registerEmployeeController = {};

const ALLOWED_EMPLOYEE_ROLES = ["Administrator", "Employee"];

registerEmployeeController.register = async (req, res) => {
  try {
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

    full_name = full_name?.trim();
    email = email?.trim();
    role = role?.trim() || "Employee";

    if (!ALLOWED_EMPLOYEE_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid employee role" });
    }

    const existEmployee = await employeeModel.findOne({ email });
    if (existEmployee) {
      return res.status(400).json({ message: "email already in use" });
    }

    const passwordHash = await bcryptjs.hash(password, 10);

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

    const htmlContent = HTMLVerificationEmail(verificationCode);

    await sendEmail(email, "Verificación de cuenta", htmlContent);

    return res.status(200).json({ message: "email send" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

registerEmployeeController.verifyCode = async (req, res) => {
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

    await employeeModel.findOneAndUpdate(
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

export default registerEmployeeController;