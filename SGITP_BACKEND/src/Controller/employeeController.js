import employeeModel from "../Model/employee.js";
import bcryptjs from "bcryptjs";

const employeeController = {};

const ALLOWED_EMPLOYEE_ROLES = ["Administrator", "Employee"];

// SELECT
employeeController.getEmployees = async (req, res) => {
  try {
    const employees = await employeeModel.find().select("-password");
    return res.status(200).json(employees);
  } catch (error) {
    console.log("getEmployees error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

employeeController.getEmployeeById = async (req, res) => {
  try {
    const employee = await employeeModel.findById(req.params.id).select("-password");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json(employee);
  } catch (error) {
    console.log("getEmployeeById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
employeeController.insertEmployee = async (req, res) => {
  try {
    const {
      full_name,
      main_phone,
      email,
      password,
      role,
      branch_id,
      addresses,
      phone_numbers,
      birth_date,
      hire_date,
      isVerified,
      loginAttempts,
      timeOut,
    } = req.body;

    const existingEmployee = await employeeModel.findOne({ email });

    if (existingEmployee) {
      return res.status(400).json({
        message: "Ya existe un empleado con este correo electrónico.",
      });
    }

    let hashedPassword = null;

    if (role === "Administrator") {
      if (!password || !String(password).trim()) {
        return res.status(400).json({
          message: "La contraseña es obligatoria para administradores.",
        });
      }

      hashedPassword = await bcrypt.hash(String(password), 10);
    }

    const newEmployee = new employeeModel({
      full_name,
      main_phone,
      email,
      password: hashedPassword,
      role,
      branch_id: branch_id || null,
      addresses: Array.isArray(addresses) ? addresses : [],
      phone_numbers: Array.isArray(phone_numbers) ? phone_numbers : [],
      birth_date: birth_date || null,
      hire_date: hire_date || null,
      isVerified: isVerified ?? true,
      loginAttempts: loginAttempts ?? 0,
      timeOut: timeOut ?? null,
    });

    await newEmployee.save();

    return res.status(201).json({
      message: "Employee saved successfully",
      employee: newEmployee,
    });
  } catch (error) {
    console.log("insertEmployee error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// UPDATE
employeeController.updateEmployee = async (req, res) => {
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

    if (!full_name || full_name.length < 3 || full_name.length > 50) {
      return res.status(400).json({ message: "Invalid name" });
    }

    if (!ALLOWED_EMPLOYEE_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid employee role" });
    }

    const employeeToUpdate = await employeeModel.findById(req.params.id);

    if (!employeeToUpdate) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let updatedPassword = employeeToUpdate.password;

    if (password && password.trim() !== "") {
      updatedPassword = await bcryptjs.hash(password, 10);
    }

    const updatedEmployee = await employeeModel.findByIdAndUpdate(
      req.params.id,
      {
        full_name,
        main_phone,
        email,
        branch_id,
        password: updatedPassword,
        addresses,
        phone_numbers,
        birth_date,
        hire_date,
        role,
        isVerified,
        loginAttempts,
        timeOut,
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.log("updateEmployee error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
employeeController.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      return res.status(400).json({
        message: "No puedes eliminar el usuario con el que has iniciado sesión.",
      });
    }

    const employeeFound = await employeeModel.findById(id);

    if (!employeeFound) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const totalEmployees = await employeeModel.countDocuments();

    if (totalEmployees <= 1) {
      return res.status(400).json({
        message: "No puedes eliminar el único usuario existente del sistema.",
      });
    }

    if (employeeFound.role === "Administrator") {
      const totalAdministrators = await employeeModel.countDocuments({
        role: "Administrator",
      });

      if (totalAdministrators <= 1) {
        return res.status(400).json({
          message: "No puedes eliminar el último administrador del sistema.",
        });
      }
    }

    await employeeModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default employeeController;