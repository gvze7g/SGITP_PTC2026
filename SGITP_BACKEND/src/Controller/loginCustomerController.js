import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import customerModel from "../Model/customer.js";
import { config } from "../config.js";

const loginCustomerController = {};

loginCustomerController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFound = await customerModel.findOne({ email });

    if (!userFound) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (userFound.timeOut && userFound.timeOut > Date.now()) {
      return res.status(403).json({ message: "Cuenta bloqueada temporalmente" });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      userFound.loginAttempts = (userFound.loginAttempts || 0) + 1;

      if (userFound.loginAttempts >= 5) {
        userFound.timeOut = Date.now() + 15 * 60 * 1000;
        userFound.loginAttempts = 0;

        await userFound.save();
        return res.status(403).json({ message: "Cuenta bloqueada" });
      }

      await userFound.save();
      return res.status(403).json({ message: "Contraseña incorrecta" });
    }

    userFound.loginAttempts = 0;
    userFound.timeOut = null;
    await userFound.save();

    const token = jsonwebtoken.sign(
      {
        id: userFound._id,
        userType: "Customer",
        customerType: userFound.customer_type,
      },
      config.JWT.secret,
      { expiresIn: "30d" }
    );

    res.cookie("authCookie", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

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
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default loginCustomerController;