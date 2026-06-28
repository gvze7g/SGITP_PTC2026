import bcrypt from "bcryptjs"; // Encriptar
import jsonwebtoken from "jsonwebtoken"; // Token

// Asegúrate de que la ruta coincida con la ubicación de tu archivo employee.js
import employeeModel from "../Model/employee.js"; 

import { config } from "../config.js";

const loginEmployeeController = {};

loginEmployeeController.login = async (req, res) => {
  try {
    //#1- Solicitar el correo y la contraseña
    const { email, password } = req.body;

    // Verificar si el correo de empleado existe en la bd
    const userFound = await employeeModel.findOne({ email });

    // Si no lo encuentra
    if (!userFound) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Verificar si la cuenta está bloqueada
    if (userFound.timeOut && userFound.timeOut > Date.now()) {
      return res.status(403).json({ message: "Cuenta bloqueada temporalmente" });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      // Si se equivoca en la contraseña
      // Vamos a sumarle 1 a los intentos fallidos
      userFound.loginAttempts = (userFound.loginAttempts || 0) + 1;

      // Bloquear la cuenta después de 5 intentos fallidos
      if (userFound.loginAttempts >= 5) {
        userFound.timeOut = Date.now() + 15 * 60 * 1000; // Bloqueo de 15 minutos
        userFound.loginAttempts = 0;

        await userFound.save();
        return res.status(403).json({ message: "Cuenta bloqueada" });
      }

      await userFound.save();

      return res.status(403).json({ message: "Contraseña incorrecta" });
    }

    // Si el login es correcto, reiniciamos los intentos y el timeout
    userFound.loginAttempts = 0;
    userFound.timeOut = null;
    await userFound.save();

    // Generar el token
    const token = jsonwebtoken.sign(
      //#1- ¿Qué vamos a guardar? (Agregamos el rol de tu esquema)
      { 
          id: userFound._id, 
          userType: "Employee",
          role: userFound.role 
      },
      //#2- Secret key
      config.JWT.secret,
      //#3- Tiempo de expiración
      { expiresIn: "30d" },
    );

    // Guardamos el token en una cookie
    res.cookie("authCookie", token);

    return res.status(200).json({ message: "Login exitoso" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default loginEmployeeController;