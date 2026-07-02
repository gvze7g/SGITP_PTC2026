//array de funciones
const posController = {};

//importo la colección que voy a ocupar
import posModel from "../Model/pos.js";

//SELECT
posController.getPos = async (req, res) => {
  try {
    const pos = await posModel.find();
    return res.status(200).json(pos);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//INSERTAR
posController.insertPos = async (req, res) => {
  try {
    //#1- solicito los datos a guardar
    let { customerId, employee_id, origin, shippingData, phone, sales_id } = req.body;

    //Guardo en la base de datos
    const newPos = new posModel({customerId, employee_id, origin, shippingData, phone, sales_id });
    await newPos.save();

    return res.status(201).json({ message: "Pos saved" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ELIMINAR
posController.deletePos = async (req, res) => {
  try {
    const deletePos = await posModel.findByIdAndDelete(req.params.id);

    //Validación por si no fue borrada la marca
    if (!deletePos) {
      return res.status(404).json({ message: "pos not found" });
    }

    return res.status(200).json({ message: "pos deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ACTUALIZAR
posController.updatePos = async (req, res) => {
  try {
    //Pedimos los nuevos datos
    let { customerId, employee_id, origin, shippingData, phone, sales_id } = req.body;
    
    //actualizamos
    const updatedPos = await posModel.findByIdAndUpdate(
      req.params.id,
      {
        customerId, 
        employee_id, 
        origin, 
        shippingData, 
        phone, 
        sales_id
      },
      { new: true },
    );

    //si no se actualiza
    if (!updatedPos) {
      return res.status(404).json({ mesage: "pos not found" });
    }

    return res.status(200).json({ message: "pos updated" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default posController;