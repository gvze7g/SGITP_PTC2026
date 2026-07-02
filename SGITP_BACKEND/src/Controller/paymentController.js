import paymentModel from "../Model/payment.js";

const paymentController = {};

// GET ALL
paymentController.getPayments = async (req, res) => {
  try {
    const payments = await paymentModel.find();
    return res.status(200).json(payments);
  } catch (error) {
    console.log("getPayments error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
paymentController.getPaymentById = async (req, res) => {
  try {
    const payment = await paymentModel.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json(payment);
  } catch (error) {
    console.log("getPaymentById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
paymentController.insertPayment = async (req, res) => {
  try {
    const {
      employee_id,
      period,
      base_salary,
      bonuses,
      retentions,
      total_paid,
      payment_date,
    } = req.body;

    const newPayment = new paymentModel({
      employee_id,
      period,
      base_salary,
      bonuses,
      retentions,
      total_paid,
      payment_date,
    });

    await newPayment.save();

    return res.status(201).json({
      message: "Payment saved successfully",
      payment: newPayment,
    });
  } catch (error) {
    console.log("insertPayment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
paymentController.updatePayment = async (req, res) => {
  try {
    const {
      employee_id,
      period,
      base_salary,
      bonuses,
      retentions,
      total_paid,
      payment_date,
    } = req.body;

    const updatedPayment = await paymentModel.findByIdAndUpdate(
      req.params.id,
      {
        employee_id,
        period,
        base_salary,
        bonuses,
        retentions,
        total_paid,
        payment_date,
      },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json({
      message: "Payment updated successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    console.log("updatePayment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
paymentController.deletePayment = async (req, res) => {
  try {
    const deletedPayment = await paymentModel.findByIdAndDelete(req.params.id);

    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.log("deletePayment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default paymentController;