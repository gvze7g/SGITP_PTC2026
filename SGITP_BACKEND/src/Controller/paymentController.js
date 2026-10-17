import { validatePastDate } from "../utils/dates.js";
import paymentModel from "../Model/payment.js";

const paymentController = {};

// GET ALL
paymentController.getPayments = async (req, res) => {
  try {
    const payments = await paymentModel.find();
    return res.status(200).json(payments);
  } catch (error) {
    console.log("getPayments error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// GET BY ID
paymentController.getPaymentById = async (req, res) => {
  try {
    const payment = await paymentModel.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    return res.status(200).json(payment);
  } catch (error) {
    console.log("getPaymentById error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
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

    const dateError = validatePastDate(payment_date, { label: "fecha de pago", minDate: "2000-01-01" });
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

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
      message: "Pago guardado correctamente",
      payment: newPayment,
    });
  } catch (error) {
    console.log("insertPayment error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
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

    const dateError = validatePastDate(payment_date, { label: "fecha de pago", minDate: "2000-01-01" });
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

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
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    return res.status(200).json({
      message: "Pago actualizado correctamente",
      payment: updatedPayment,
    });
  } catch (error) {
    console.log("updatePayment error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// DELETE
paymentController.deletePayment = async (req, res) => {
  try {
    const deletedPayment = await paymentModel.findByIdAndDelete(req.params.id);

    if (!deletedPayment) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    return res.status(200).json({ message: "Pago eliminado correctamente" });
  } catch (error) {
    console.log("deletePayment error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default paymentController;