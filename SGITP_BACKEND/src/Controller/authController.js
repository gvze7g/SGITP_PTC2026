import employeeModel from "../Model/employee.js";
import customerModel from "../Model/customer.js";

const authController = {};

// Obtiene la información del usuario autenticado
authController.me = async (req, res) => {
  try {
   // Extrae del token (o middleware de autenticación) el id y tipo de usuario
    const { id, userType } = req.user;

    // Si el usuario autenticado es un empleado
    if (userType === "Employee") {
      // Busca al empleado por id y excluye el campo password por seguridad
      const employee = await employeeModel.findById(id).select("-password");

      // Si no existe en base de datos, responde 404
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Si existe, responde 200 con el tipo y sus datos
      return res.status(200).json({
        userType: "Employee",
        user: employee,
      });
    }

    // Si el usuario autenticado es un cliente
    if (userType === "Customer") {
      // Busca al cliente por id y excluye el campo password por seguridad
      const customer = await customerModel.findById(id).select("-password");

      // Si no existe en base de datos, responde 404
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // Si existe, responde 200 con el tipo y sus datos
      return res.status(200).json({
        userType: "Customer",
        user: customer,
      });
    }

    // Si el tipo de usuario no es válido o no está contemplado
    return res.status(400).json({ message: "Invalid user type" });
  } catch (error) {
    // Manejo de errores inesperados del servidor
    console.log("me error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default authController;