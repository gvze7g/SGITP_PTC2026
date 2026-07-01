import bcryptjs from "bcryptjs";
import employeeModel from "../Model/employee.js";

const employeeController = {};

// GET ALL
employeeController.getEmployees = async (req, res) => {
  try {
    const employees = await employeeModel.find().select("-password");
    return res.status(200).json(employees);
  } catch (error) {
    console.log("getEmployees error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
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

    if (!full_name || full_name.length < 3 || full_name.length > 50) {
      return res.status(400).json({ message: "Invalid name" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingEmployee = await employeeModel.findOne({ email });

    if (existingEmployee) {
      return res.status(400).json({ message: "Email already in use" });
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
      loginAttempts: loginAttempts || 0,
      timeOut: timeOut || null,
    });

    await newEmployee.save();

    return res.status(201).json({
      message: "Employee saved successfully",
      employee: newEmployee,
    });
  } catch (error) {
    console.log("insertEmployee error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    if (!full_name || full_name.length < 3 || full_name.length > 50) {
      return res.status(400).json({ message: "Invalid name" });
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
    const deletedEmployee = await employeeModel.findByIdAndDelete(req.params.id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.log("deleteEmployee error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default employeeController;