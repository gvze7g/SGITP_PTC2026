import branchesModel from "../Model/branches.js";

const branchesController = {};

//GET 
branchesController.getBranches = async (req, res) => {
  try {
    const branches = await branchesModel.find();
    return res.status(200).json(branches);
  } catch (error) {
    console.log("getBranches error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

branchesController.getPublicBranches = async (req, res) => {
  try {
    const branches = await branchesModel
      .find({ isActive: { $ne: false } })
      .select("name address phone email opening_date isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json(branches);
  } catch (error) {
    console.log("getPublicBranches error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//GET by ID obtiene una sucursal por su ID
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

//Insert registrar una nueva sucursal
branchesController.insertBranch = async (req, res) => {
  try {
    const { name, address, phone, email, isActive, opening_date } = req.body;

    const newBranch = new branchesModel({
      name,
      address,
      phone,
      email,
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

//Update actualizar una sucursal existente
branchesController.updateBranch = async (req, res) => {
  try {
    const { name, address, phone, email, isActive, opening_date } = req.body;

    const updatedBranch = await branchesModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        address,
        phone,
        email,
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

//Delete eliminar una sucursal por su ID
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
