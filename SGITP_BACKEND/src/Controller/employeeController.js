import employeeModel from "../Model/employee.js";

//creamos un array de funciones
const employeeController = {};

//SELECT
employeeController.getEmployee = async (req, res) => {
  try {
    const employee = await employeeModel.find();
    return res.status(200).json(employee);
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//DELETE
employeeController.deleteEmployee = async (req, res) => {
  try {
    const deletedEmployee = await employeeModel.findByIdAndDelete(
      req.params.id,
    );
    if (!deletedEmployee) {
      return res.status(404).json({ message: "employee not found" });
    }

    return res.status(200).json({ message: "employee deleted" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//UPDATE
employeeController.updateEmployee = async (req, res) => {
  try {
    //Solitamos los datos
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

    //VALIDACIONES
    //Sanitizar
    full_name = full_name?.trim();
    email = email?.trim();

    //validar el tamaño del nombre
    if (full_name.length < 3 || full_name.length > 15) {
      return res.status(400).json({ message: "Invalid name" });
    }

    //Actualizamos
    const updatedEmployee = await employeeModel.findByIdAndUpdate(
      req.params.id,
      {
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
      },
      { new: true },
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({ message: "Employee updated" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default employeeController;