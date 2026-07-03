import customerModel from "../Model/customer.js";

const customerController = {};

const ALLOWED_CUSTOMER_TYPES = ["Client", "Wholesale"];

// SELECT
customerController.getCustomers = async (req, res) => {
  try {
    const customers = await customerModel.find();
    return res.status(200).json(customers);
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
customerController.deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await customerModel.findByIdAndDelete(req.params.id);

    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ message: "Customer deleted" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
customerController.updateCustomer = async (req, res) => {
  try {
    let {
      customer_type,
      full_name,
      main_phone,
      email,
      password,
      addresses,
      phone_numbers,
      isVerified,
      loginAttempts,
      timeOut,
    } = req.body;

    full_name = full_name?.trim();
    email = email?.trim();
    customer_type = customer_type?.trim() || "Client";

    if (!full_name || full_name.length < 3 || full_name.length > 50) {
      return res.status(400).json({ message: "Invalid name" });
    }

    if (!ALLOWED_CUSTOMER_TYPES.includes(customer_type)) {
      return res.status(400).json({ message: "Invalid customer type" });
    }

    const updatedCustomer = await customerModel.findByIdAndUpdate(
      req.params.id,
      {
        customer_type,
        full_name,
        main_phone,
        email,
        password,
        addresses,
        phone_numbers,
        isVerified,
        loginAttempts,
        timeOut,
      },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ message: "Customer updated" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default customerController;