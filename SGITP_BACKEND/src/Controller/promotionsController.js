import promotionsModel from "../Model/promotions.js";

const promotionsController = {};

// GET ALL
promotionsController.getPromotions = async (req, res) => {
  try {
    const promotions = await promotionsModel.find();
    return res.status(200).json(promotions);
  } catch (error) {
    console.log("getPromotions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
promotionsController.getPromotionById = async (req, res) => {
  try {
    const promotion = await promotionsModel.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    return res.status(200).json(promotion);
  } catch (error) {
    console.log("getPromotionById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
promotionsController.insertPromotion = async (req, res) => {
  try {
    let {
      coupon_code,
      descriptions,
      discount_percentage,
      start_date,
      end_date,
      isActive,
    } = req.body;

    coupon_code = coupon_code?.trim();

    if (!coupon_code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(coupon_code)) {
      return res.status(400).json({
        message: "Coupon code must only contain letters and numbers",
      });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: "Start date and end date are required",
      });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    let statusFinal = isActive !== undefined ? isActive : true;

    if (statusFinal === true) {
      if (now < start || now > end) {
        statusFinal = false;
      }
    }

    const newPromotion = new promotionsModel({
      coupon_code,
      descriptions,
      discount_percentage,
      start_date: start,
      end_date: end,
      isActive: statusFinal,
    });

    await newPromotion.save();

    return res.status(201).json({
      message: "Promotion saved successfully",
      promotion: newPromotion,
    });
  } catch (error) {
    console.log("insertPromotion error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
promotionsController.updatePromotion = async (req, res) => {
  try {
    let {
      coupon_code,
      descriptions,
      discount_percentage,
      start_date,
      end_date,
      isActive,
    } = req.body;

    if (coupon_code !== undefined) {
      coupon_code = coupon_code?.trim();

      if (!coupon_code) {
        return res.status(400).json({ message: "Coupon code cannot be empty" });
      }

      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      if (!alphanumericRegex.test(coupon_code)) {
        return res.status(400).json({
          message: "Coupon code must only contain letters and numbers",
        });
      }
    }

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: "Both start date and end date are required to update periods",
      });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    let statusFinal = isActive !== undefined ? isActive : true;

    if (statusFinal === true) {
      if (now < start || now > end) {
        statusFinal = false;
      }
    }

    const updatedPromotion = await promotionsModel.findByIdAndUpdate(
      req.params.id,
      {
        coupon_code,
        descriptions,
        discount_percentage,
        start_date: start,
        end_date: end,
        isActive: statusFinal,
      },
      { new: true }
    );

    if (!updatedPromotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    return res.status(200).json({
      message: "Promotion updated successfully",
      promotion: updatedPromotion,
    });
  } catch (error) {
    console.log("updatePromotion error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
promotionsController.deletePromotion = async (req, res) => {
  try {
    const deletedPromotion = await promotionsModel.findByIdAndDelete(req.params.id);

    if (!deletedPromotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    return res.status(200).json({ message: "Promotion deleted successfully" });
  } catch (error) {
    console.log("deletePromotion error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default promotionsController;