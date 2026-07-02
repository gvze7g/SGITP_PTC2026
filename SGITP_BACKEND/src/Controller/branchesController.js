import branchesModel from "../Model/branches.js";

const branchesController = {};

branchesController.getBranches = async (req, res) => {
  try {
    const branches = await branchesModel.find();
    return res.status(200).json(branches);
  } catch (error) {
    console.log("getBranches error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

branchesController.getBranchById = async (req, res) => {
  try {
    const branch = await branchesModel.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    return res.status(200).json(branch);
  } catch (error) {
    console.log("getBranchById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

branchesController.insertBranch = async (req, res) => {
  try {
    const { name, address, phone, email, employee_id, isActive, opening_date } = req.body;

    const newBranch = new branchesModel({
      name,
      address,
      phone,
      email,
      employee_id,
      isActive,
      opening_date,
    });

    await newBranch.save();

    return res.status(201).json({
      message: "Branch saved successfully",
      branch: newBranch,
    });
  } catch (error) {
    console.log("insertBranch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

branchesController.updateBranch = async (req, res) => {
  try {
    const { name, address, phone, email, employee_id, isActive, opening_date } = req.body;

    const updatedBranch = await branchesModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        address,
        phone,
        email,
        employee_id,
        isActive,
        opening_date,
      },
      { new: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    return res.status(200).json({
      message: "Branch updated successfully",
      branch: updatedBranch,
    });
  } catch (error) {
    console.log("updateBranch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

branchesController.deleteBranch = async (req, res) => {
  try {
    const deletedBranch = await branchesModel.findByIdAndDelete(req.params.id);

    if (!deletedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    return res.status(200).json({ message: "Branch deleted successfully" });
  } catch (error) {
    console.log("deleteBranch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default branchesController;