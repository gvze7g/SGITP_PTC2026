//array de funciones
const salesController = {};

//importo la colección que voy a ocupar
import salesModel from "../Model/sales.js";

//SELECT
salesController.getSales = async (req, res) => {
  try {
    const sales = await salesModel.find();
    return res.status(200).json(sales);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//INSERTAR
salesController.insertSales = async (req, res) => {
  try {
    //#1- solicito los datos a guardar
    let { employee_id, cart_id, origin, applied_price_type, payment_method, payment_status, shipping_address, shipping_phone, item_details } = req.body;

    //Guardo en la base de datos
    const newSales = new salesModel({employee_id, cart_id, origin, applied_price_type, payment_method, payment_status, shipping_address, shipping_phone, item_details });
    await newSales.save();

    return res.status(201).json({ message: "Sales saved" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ELIMINAR
salesController.deleteSales = async (req, res) => {
  try {
    const deleteSales = await salesModel.findByIdAndDelete(req.params.id);

    //Validación por si no fue borrada la marca
    if (!deleteSales) {
      return res.status(404).json({ message: "sales not found" });
    }

    return res.status(200).json({ message: "sales deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ACTUALIZAR
salesController.updateSales = async (req, res) => {
  try {
    //Pedimos los nuevos datos
    let { employee_id, cart_id, origin, applied_price_type, payment_method, payment_status, shipping_address, shipping_phone, item_details } = req.body;
    
    //actualizamos
    const updatedSales = await salesModel.findByIdAndUpdate(
      req.params.id,
      {
        employee_id, 
        cart_id, 
        origin, 
        applied_price_type, 
        payment_method,
        payment_status, 
        shipping_address, 
        shipping_phone, 
        item_details
      },
      { new: true },
    );

    //si no se actualiza
    if (!updatedSales) {
      return res.status(404).json({ mesage: "sales not found" });
    }

    return res.status(200).json({ message: "sales updated" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default salesController;