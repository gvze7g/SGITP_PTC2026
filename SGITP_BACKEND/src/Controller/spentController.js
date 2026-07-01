import spentModel from "../Model/spent.js";

const spentController = {};

// GET ALL
spentController.getSpent = async (req, res) => {
  try {
    const spent = await spentModel.find();
    return res.status(200).json(spent);
  } catch (error) {
    console.log("getSpent error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
spentController.getSpentById = async (req, res) => {
  try {
    const spent = await spentModel.findById(req.params.id);

    if (!spent) {
      return res.status(404).json({ message: "Spent not found" });
    }

    return res.status(200).json(spent);
  } catch (error) {
    console.log("getSpentById error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    const newSpent = new spentModel({
      descriptions,
      amount,
      expense_date,
      expense_type,
      payment_method,
      branch_id,
    });

    await newSpent.save();

    return res.status(201).json({
      message: "Spent saved successfully",
      spent: newSpent,
    });
  } catch (error) {
    console.log("insertSpent error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    const updatedSpent = await spentModel.findByIdAndUpdate(
      req.params.id,
      {
        descriptions,
        amount,
        expense_date,
        expense_type,
        payment_method,
        branch_id,
      },
      { new: true }
    );

    if (!updatedSpent) {
      return res.status(404).json({ message: "Spent not found" });
    }

    return res.status(200).json({
      message: "Spent updated successfully",
      spent: updatedSpent,
    });
  } catch (error) {
    console.log("updateSpent error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
spentController.deleteSpent = async (req, res) => {
  try {
    const deletedSpent = await spentModel.findByIdAndDelete(req.params.id);

    if (!deletedSpent) {
      return res.status(404).json({ message: "Spent not found" });
    }

    return res.status(200).json({ message: "Spent deleted successfully" });
  } catch (error) {
    console.log("deleteSpent error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default spentController;