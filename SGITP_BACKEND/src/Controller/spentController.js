//array de funciones
const spentController = {};

//importo la colección que voy a ocupar
import spentModel from "../Model/spent.js";

//SELECT
spentController.getSpent = async (req, res) => {
  try {
    const spent = await spentModel.find();
    return res.status(200).json(spent);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//INSERTAR
spentController.insertSpent = async (req, res) => {
  try {
    //#1- solicito los datos a guardar
    let { descriptions, amount, expense_date, expense_type, payment_method, branch_id } = req.body;

    //Guardo en la base de datos
    const newSpent = new spentModel({descriptions, amount, expense_date, expense_type, payment_method, branch_id });
    await newSpent.save();

    return res.status(201).json({ message: "Spent saved" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ELIMINAR
spentController.deleteSpent = async (req, res) => {
  try {
    const deleteSpent = await spentModel.findByIdAndDelete(req.params.id);

    //Validación por si no fue borrada la marca
    if (!deleteSpent) {
      return res.status(404).json({ message: "spent not found" });
    }

    return res.status(200).json({ message: "spent deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ACTUALIZAR
spentController.updateSpent = async (req, res) => {
  try {
    //Pedimos los nuevos datos
    let { descriptions, amount, expense_date, expense_type, payment_method, branch_id } = req.body;
    
    //actualizamos
    const updatedSpent = await spentModel.findByIdAndUpdate(
      req.params.id,
      {
        descriptions, 
        amount,
        expense_date,
        expense_type, 
        payment_method, 
        branch_id
      },
      { new: true },
    );

    //si no se actualiza
    if (!updatedSpent) {
      return res.status(404).json({ mesage: "spent not found" });
    }

    return res.status(200).json({ message: "spent updated" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default spentController;