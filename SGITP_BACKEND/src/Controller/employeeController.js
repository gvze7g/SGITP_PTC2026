import employeeModel from "../Model/employee.js";
import bcryptjs from "bcryptjs";
import { toDateString, toStoredDate, validateEmployeeDates } from "../utils/dates.js";

// Aquí guardamos todas las funciones relacionadas con empleados
const employeeController = {};

// Roles permitidos para un empleado
const ALLOWED_EMPLOYEE_ROLES = ["Administrator", "Employee"];

// =========================
// OBTENER TODOS LOS EMPLEADOS
// =========================
employeeController.getEmployees = async (req, res) => {
  try {
    // Busca todos los empleados, pero oculta el campo password
    const employees = await employeeModel
      .find()
      .select("-password")
      .populate("branch_id", "name");
    return res.status(200).json(employees);
  } catch (error) {
    console.log("getEmployees error:", error);
    // Si algo falla, responde error interno
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// =========================
// OBTENER EMPLEADO POR ID
// =========================
employeeController.getEmployeeById = async (req, res) => {
  try {
    // Busca un empleado por su ID y también oculta password
    const employee = await employeeModel
      .findById(req.params.id)
      .select("-password")
      .populate("branch_id", "name");

    // Si no existe, avisa
    if (!employee) {
      return res.status(404).json({ message: "No encontramos un empleado con ese correo" });
    }

    // Si existe, lo devuelve
    return res.status(200).json(employee);
  } catch (error) {
    console.log("getEmployeeById error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// =========================
// CREAR EMPLEADO
// =========================
employeeController.insertEmployee = async (req, res) => {
  try {
    // Saca los datos que vienen del frontend
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
      position,
      base_salary,
    } = req.body;

    // Nacimiento: mayor de 18 años. Contratación: puede ser antigua, pero no
    // futura ni de cuando todavía era menor de edad.
    const datesError = validateEmployeeDates({ birth_date, hire_date });
    if (datesError) {
      return res.status(400).json({ message: datesError });
    }

    // Revisa si ya existe alguien con ese correo
    const existingEmployee = await employeeModel.findOne({ email });

    if (existingEmployee) {
      return res.status(400).json({
        message: "Ya existe un empleado con este correo electrónico.",
      });
    }

    // Por defecto no hay contraseña encriptada
    let hashedPassword = null;

    // Si es administrador, sí o sí necesita contraseña
    if (role === "Administrator") {
      if (!password || !String(password).trim()) {
        return res.status(400).json({
          message: "La contraseña es obligatoria para administradores.",
        });
      }

      // Encripta la contraseña para guardarla segura
      hashedPassword = await bcryptjs.hash(String(password), 10);
    }

    // Crea el nuevo empleado con los datos recibidos
    const newEmployee = new employeeModel({
      full_name,
      main_phone,
      email,
      password: hashedPassword,
      role,
      branch_id: branch_id || null,
      addresses: Array.isArray(addresses) ? addresses : [],
      phone_numbers: Array.isArray(phone_numbers) ? phone_numbers : [],
      birth_date: toStoredDate(toDateString(birth_date)),
      hire_date: toStoredDate(toDateString(hire_date)),
      isVerified: isVerified ?? true,
      loginAttempts: loginAttempts ?? 0,
      timeOut: timeOut ?? null,
      position: position || "",
      base_salary: Number(base_salary || 0),
    });

    // Guarda en base de datos
    await newEmployee.save();

    return res.status(201).json({
      message: "Empleado guardado correctamente",
      employee: newEmployee,
    });
  } catch (error) {
    console.log("insertEmployee error:", error);
    return res.status(500).json({
      message: "Ocurrió un error en el servidor, intenta de nuevo",
    });
  }
};

// =========================
// ACTUALIZAR EMPLEADO
// =========================
employeeController.updateEmployee = async (req, res) => {
  try {
    // Toma los datos enviados para actualizar
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
      position,
      base_salary,
    } = req.body;

    // Limpieza básica de texto
    full_name = full_name?.trim();
    email = email?.trim();
    role = role?.trim() || "Employee";

    // Validación simple del nombre
    if (!full_name || full_name.length < 3 || full_name.length > 50) {
      return res.status(400).json({ message: "El nombre debe tener entre 3 y 50 caracteres" });
    }

    // Validación simple del rol
    if (!ALLOWED_EMPLOYEE_ROLES.includes(role)) {
      return res.status(400).json({ message: "Rol de empleado inválido" });
    }

    // Nacimiento: mayor de 18 años. Contratación: puede ser antigua, pero no
    // futura ni de cuando todavía era menor de edad.
    const datesError = validateEmployeeDates({ birth_date, hire_date });
    if (datesError) {
      return res.status(400).json({ message: datesError });
    }

    // Busca al empleado que se quiere editar
    const employeeToUpdate = await employeeModel.findById(req.params.id);

    if (!employeeToUpdate) {
      return res.status(404).json({ message: "No encontramos un empleado con ese correo" });
    }

    // Mantiene la contraseña actual, a menos que llegue una nueva
    let updatedPassword = employeeToUpdate.password;

    if (password && password.trim() !== "") {
      // Si llega nueva contraseña, la encripta
      updatedPassword = await bcryptjs.hash(password, 10);
    }

    // Actualiza y devuelve el empleado ya editado (sin password)
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
        birth_date: toStoredDate(toDateString(birth_date)),
        hire_date: toStoredDate(toDateString(hire_date)),
        role,
        isVerified,
        loginAttempts,
        timeOut,
        position,
        base_salary: base_salary !== undefined ? Number(base_salary || 0) : undefined,
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      message: "Empleado actualizado correctamente",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.log("updateEmployee error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// =========================
// ELIMINAR EMPLEADO
// =========================
employeeController.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // No permite borrar al usuario que está logueado actualmente
    if (req.user?.id === id) {
      return res.status(400).json({
        message: "No puedes eliminar el usuario con el que has iniciado sesión.",
      });
    }

    // Verifica que el empleado exista
    const employeeFound = await employeeModel.findById(id);

    if (!employeeFound) {
      return res.status(404).json({
        message: "No encontramos un empleado con ese correo",
      });
    }

    // Evita que se elimine el único usuario del sistema
    const totalEmployees = await employeeModel.countDocuments();

    if (totalEmployees <= 1) {
      return res.status(400).json({
        message: "No puedes eliminar el único usuario existente del sistema.",
      });
    }

    // Si es admin, revisa que no sea el último administrador
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

    // Si pasa todas las validaciones, lo elimina
    await employeeModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Empleado eliminado correctamente",
    });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({
      message: "Ocurrió un error en el servidor, intenta de nuevo",
    });
  }
};

export default employeeController;