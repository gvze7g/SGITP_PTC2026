import employeeModel from "../Model/employee.js";
import customerModel from "../Model/customer.js";

const authController = {};

authController.me = async (req, res) => {
  try {
    const { id, userType } = req.user;

    if (userType === "Employee") {
      const employee = await employeeModel.findById(id).select("-password");

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      return res.status(200).json({
        userType: "Employee",
        user: employee,
      });
    }

    if (userType === "Customer") {
      const customer = await customerModel.findById(id).select("-password");

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      return res.status(200).json({
        userType: "Customer",
        user: customer,
      });
    }

    return res.status(400).json({ message: "Invalid user type" });
  } catch (error) {
    console.log("me error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default authController;