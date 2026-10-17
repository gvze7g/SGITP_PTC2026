import { toDateString, toStoredDate, validatePastDate } from "../utils/dates.js";
import spentModel from "../Model/spent.js";

const spentController = {};

// GET ALL
spentController.getSpent = async (req, res) => {
  try {
    const spent = await spentModel.find();
    return res.status(200).json(spent);
  } catch (error) {
    console.log("getSpent error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// GET BY ID
spentController.getSpentById = async (req, res) => {
  try {
    const spent = await spentModel.findById(req.params.id);

    if (!spent) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    return res.status(200).json(spent);
  } catch (error) {
    console.log("getSpentById error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// INSERT
spentController.insertSpent = async (req, res) => {
  try {
    const {
      descriptions,
      amount,
      expense_date,
      expense_type,
      payment_method,
      branch_id,
    } = req.body;

    // Un gasto registra algo que ya pasó: la fecha es obligatoria y no
    // puede ser futura.
    const dateError = validatePastDate(expense_date, {
      label: "fecha del gasto",
      required: true,
      minDate: "2000-01-01",
    });
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const newSpent = new spentModel({
      descriptions,
      amount,
      expense_date: toStoredDate(toDateString(expense_date)),
      expense_type,
      payment_method,
      branch_id,
    });

    await newSpent.save();

    return res.status(201).json({
      message: "Gasto guardado correctamente",
      spent: newSpent,
    });
  } catch (error) {
    console.log("insertSpent error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// UPDATE
spentController.updateSpent = async (req, res) => {
  try {
    const {
      descriptions,
      amount,
      expense_date,
      expense_type,
      payment_method,
      branch_id,
    } = req.body;

    // Un gasto registra algo que ya pasó: la fecha es obligatoria y no
    // puede ser futura.
    const dateError = validatePastDate(expense_date, {
      label: "fecha del gasto",
      required: true,
      minDate: "2000-01-01",
    });
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const updatedSpent = await spentModel.findByIdAndUpdate(
      req.params.id,
      {
        descriptions,
        amount,
        expense_date: toStoredDate(toDateString(expense_date)),
        expense_type,
        payment_method,
        branch_id,
      },
      { new: true }
    );

    if (!updatedSpent) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    return res.status(200).json({
      message: "Gasto actualizado correctamente",
      spent: updatedSpent,
    });
  } catch (error) {
    console.log("updateSpent error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// DELETE
spentController.deleteSpent = async (req, res) => {
  try {
    const deletedSpent = await spentModel.findByIdAndDelete(req.params.id);

    if (!deletedSpent) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    return res.status(200).json({ message: "Gasto eliminado correctamente" });
  } catch (error) {
    console.log("deleteSpent error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default spentController;