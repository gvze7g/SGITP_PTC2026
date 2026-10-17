import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import employeeModel from "../Model/employee.js";
import { config } from "../config.js";
import { getAuthCookieOptions } from "../utils/cookieOptions.js";

const loginEmployeeController = {};

loginEmployeeController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar empleado por correo
    const userFound = await employeeModel.findOne({ email });

    if (!userFound) {
      return res.status(404).json({ message: "No encontramos un empleado con ese correo" });
    }

    // Revisar si la cuenta sigue bloqueada por intentos fallidos
    if (userFound.timeOut && userFound.timeOut > Date.now()) {
      return res.status(403).json({ message: "Cuenta bloqueada temporalmente" });
    }

    // El panel es solo para administradores; los demás empleados no tienen
    // contraseña (antes bcrypt fallaba con un error 500 en ese caso).
    if (userFound.role !== "Administrator" || !userFound.password) {
      return res.status(403).json({ message: "Solo los administradores pueden ingresar al panel" });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "La contraseña es obligatoria" });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      // Si la contraseña falla, aumenta intentos
      userFound.loginAttempts = (userFound.loginAttempts || 0) + 1;

      // Bloquea la cuenta por 15 min al llegar a 5 intentos
      if (userFound.loginAttempts >= 5) {
        userFound.timeOut = Date.now() + 15 * 60 * 1000;
        userFound.loginAttempts = 0;

        await userFound.save();
        return res.status(403).json({ message: "Cuenta bloqueada" });
      }

      await userFound.save();
      return res.status(403).json({ message: "Contraseña incorrecta" });
    }

    // Si el login es correcto, reinicia contador y desbloqueo
    userFound.loginAttempts = 0;
    userFound.timeOut = null;
    await userFound.save();

    // Crear token con datos del empleado y su rol
    const token = jsonwebtoken.sign(
      {
        id: userFound._id,
        userType: "Employee",
        role: userFound.role,
      },
      config.JWT.secret,
      { expiresIn: "30d" }
    );

    // Guardar sesión en cookie
    res.cookie("authCookie", token, getAuthCookieOptions(30 * 24 * 60 * 60 * 1000));

    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: userFound._id,
        full_name: userFound.full_name,
        email: userFound.email,
        role: userFound.role,
      },
    });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default loginEmployeeController;