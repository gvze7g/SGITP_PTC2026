import customerModel from "../Model/customer.js";

const customerController = {};

const ALLOWED_CUSTOMER_TYPES = ["Client", "Wholesale"];
const ADDRESS_CITIES = [
  "San Salvador",
  "Santa Ana",
  "San Miguel",
  "Soyapango",
  "Apopa",
  "Mejicanos",
  "Santa Tecla",
  "Antiguo Cuscatlan",
  "Sonsonate",
  "Usulutan",
];
const ADDRESS_TEXT_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]*$/;
const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]*$/;
const PHONE_PATTERN = /^[0-9]*$/;

const validateAddressPayload = ({ label = "", street_and_number = "", city = "", reference = "" }) => {
  if (!street_and_number?.trim() || !city?.trim()) {
    return "Address and city are required";
  }

  if (!ADDRESS_CITIES.includes(city)) {
    return "Invalid city";
  }

  if (label.length > 30 || street_and_number.length > 80 || reference.length > 80) {
    return "Address fields are too long";
  }

  if (
    !ADDRESS_TEXT_PATTERN.test(label) ||
    !ADDRESS_TEXT_PATTERN.test(street_and_number) ||
    !ADDRESS_TEXT_PATTERN.test(reference)
  ) {
    return "Address fields can only contain letters and numbers";
  }

  return null;
};

// SELECT
customerController.getCustomers = async (req, res) => {
  try {
    const customers = await customerModel.find();
    return res.status(200).json(customers);
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// INSERT
customerController.insertCustomer = async (req, res) => {
  try {
    let {
      customer_type,
      full_name,
      main_phone,
      email,
      addresses = [],
      phone_numbers = [],
      isVerified = true,
      loginAttempts = 0,
      timeOut = null,
    } = req.body;

    full_name = full_name?.trim();
    email = email?.trim();
    customer_type = customer_type?.trim() || "Client";

    if (!full_name || full_name.length < 3 || full_name.length > 50) {
      return res.status(400).json({ message: "El nombre debe tener entre 3 y 50 caracteres" });
    }

    if (!ALLOWED_CUSTOMER_TYPES.includes(customer_type)) {
      return res.status(400).json({ message: "Tipo de cliente inválido" });
    }

    if (email) {
      const existingCustomer = await customerModel.findOne({ email });

      if (existingCustomer) {
        return res.status(400).json({ message: "Este correo ya está registrado" });
      }
    }

    const newCustomer = new customerModel({
      customer_type,
      full_name,
      main_phone,
      email,
      addresses,
      phone_numbers,
      isVerified,
      loginAttempts,
      timeOut,
    });

    await newCustomer.save();

    return res.status(201).json({
      message: "Cliente guardado",
      customer: newCustomer,
    });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// DELETE
customerController.deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await customerModel.findByIdAndDelete(req.params.id);

    if (!deletedCustomer) {
      return res.status(404).json({ message: "No encontramos una cuenta con ese correo" });
    }

    return res.status(200).json({ message: "Cliente eliminado" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
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

    // Limpia espacios al inicio y final en los campos de texto
    full_name = full_name?.trim();
    email = email?.trim();

    // Si no viene customer_type, asigna "Client" por defecto
    customer_type = customer_type?.trim() || "Client";

  // Valida nombre:
  // - obligatorio
  // - mínimo 3 caracteres
  // - máximo 50 caracteres
  if (!full_name || full_name.length < 3 || full_name.length > 50) {
  return res.status(400).json({ message: "El nombre debe tener entre 3 y 50 caracteres" });
  }

  // Valida que el tipo de cliente esté dentro de los permitidos
    if (!ALLOWED_CUSTOMER_TYPES.includes(customer_type)) {
    return res.status(400).json({ message: "Tipo de cliente inválido" });
  }

    //Update actualiza el cliente
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
      return res.status(404).json({ message: "No encontramos una cuenta con ese correo" });
    }

    return res.status(200).json({ message: "Cliente actualizado" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// UPDATE de los datos básicos del cliente autenticado (nombre y teléfono
// principal). Deliberadamente no toca email/password/customer_type: eso
// necesitaría re-verificación y no es lo que pide "Editar Perfil".
customerController.updateMyProfile = async (req, res) => {
  try {
    const { full_name, main_phone } = req.body;
    const trimmedName = full_name?.trim() ?? "";
    const trimmedPhone = main_phone?.trim() ?? "";

    if (trimmedName.length < 3 || trimmedName.length > 50) {
      return res.status(400).json({ message: "El nombre debe tener entre 3 y 50 caracteres" });
    }

    if (!NAME_PATTERN.test(trimmedName)) {
      return res.status(400).json({ message: "El nombre solo puede tener letras" });
    }

    if (trimmedPhone && (!PHONE_PATTERN.test(trimmedPhone) || trimmedPhone.length > 12)) {
      return res.status(400).json({ message: "El teléfono debe tener entre 8 y 12 dígitos" });
    }

    const updatedCustomer = await customerModel
      .findByIdAndUpdate(
        req.user.id,
        { full_name: trimmedName, main_phone: trimmedPhone },
        { new: true }
      )
      .select("-password");

    if (!updatedCustomer) {
      return res.status(404).json({ message: "No encontramos una cuenta con ese correo" });
    }

    return res.status(200).json({
      message: "Perfil actualizado",
      user: updatedCustomer,
    });
  } catch (error) {
    console.log("updateMyProfile error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// SELECT direcciones del cliente autenticado
customerController.getMyAddresses = async (req, res) => {
  try {
    const customer = await customerModel.findById(req.user.id).select("addresses");

    if (!customer) {
      return res.status(404).json({ message: "No encontramos una cuenta con ese correo" });
    }

    return res.status(200).json(customer.addresses || []);
  } catch (error) {
    console.log("getMyAddresses error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// INSERT direccion del cliente autenticado
customerController.addMyAddress = async (req, res) => {
  try {
    const { label, street_and_number, city, reference, isPrimary = false } = req.body;
    const addressError = validateAddressPayload({ label, street_and_number, city, reference });

    if (addressError) {
      return res.status(400).json({ message: addressError });
    }

    const customer = await customerModel.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({ message: "No encontramos una cuenta con ese correo" });
    }

    if (isPrimary) {
      customer.addresses.forEach((address) => {
        address.isPrimary = false;
      });
    }

    customer.addresses.push({
      label,
      street_and_number,
      city,
      reference,
      isPrimary: Boolean(isPrimary) || customer.addresses.length === 0,
    });

    await customer.save();

    return res.status(201).json({
      message: "Dirección guardada",
      addresses: customer.addresses,
    });
  } catch (error) {
    console.log("addMyAddress error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// UPDATE direccion del cliente autenticado
customerController.updateMyAddress = async (req, res) => {
  try {
    const { label, street_and_number, city, reference, isPrimary = false } = req.body;
    const addressError = validateAddressPayload({ label, street_and_number, city, reference });
    const customer = await customerModel.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({ message: "No encontramos una cuenta con ese correo" });
    }

    const address = customer.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({ message: "Dirección no encontrada" });
    }

    if (addressError) {
      return res.status(400).json({ message: addressError });
    }

    if (isPrimary) {
      customer.addresses.forEach((currentAddress) => {
        currentAddress.isPrimary = false;
      });
    }

    address.label = label;
    address.street_and_number = street_and_number;
    address.city = city;
    address.reference = reference;
    address.isPrimary = Boolean(isPrimary);

    await customer.save();

    return res.status(200).json({
      message: "Dirección actualizada",
      addresses: customer.addresses,
    });
  } catch (error) {
    console.log("updateMyAddress error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// DELETE direccion del cliente autenticado
customerController.deleteMyAddress = async (req, res) => {
  try {
    const customer = await customerModel.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({ message: "No encontramos una cuenta con ese correo" });
    }

    const address = customer.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({ message: "Dirección no encontrada" });
    }

    const wasPrimary = address.isPrimary;

    address.deleteOne();

    if (wasPrimary && customer.addresses[0]) {
      customer.addresses[0].isPrimary = true;
    }

    await customer.save();

    return res.status(200).json({
      message: "Dirección eliminada",
      addresses: customer.addresses,
    });
  } catch (error) {
    console.log("deleteMyAddress error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default customerController;
