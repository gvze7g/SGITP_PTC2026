import paymentMethodModel from "../Model/paymentMethod.js";

const paymentMethodController = {};

const LAST4_PATTERN = /^\d{4}$/;

// GET de las tarjetas guardadas del cliente logueado
paymentMethodController.getMyPaymentMethods = async (req, res) => {
  try {
    const cards = await paymentMethodModel
      .find({ customer_id: req.user.id })
      .sort({ isPrimary: -1, createdAt: -1 });

    return res.status(200).json(cards);
  } catch (error) {
    console.log("getMyPaymentMethods error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT de una tarjeta para el cliente logueado. El número completo y el
// CVC nunca llegan aquí: el teléfono solo manda la marca y los últimos 4
// dígitos (ver mobile CardsScreen), lo suficiente para mostrarla en la lista.
paymentMethodController.addMyPaymentMethod = async (req, res) => {
  try {
    const { brand, last4, expiry_month, expiry_year, holder_name, isPrimary = false } = req.body;

    if (!LAST4_PATTERN.test(last4 || "")) {
      return res.status(400).json({ message: "Invalid card" });
    }

    const customer_id = req.user.id;

    if (isPrimary) {
      await paymentMethodModel.updateMany({ customer_id }, { isPrimary: false });
    }

    const existingCount = await paymentMethodModel.countDocuments({ customer_id });

    const newCard = new paymentMethodModel({
      customer_id,
      brand,
      last4,
      expiry_month,
      expiry_year,
      holder_name,
      isPrimary: Boolean(isPrimary) || existingCount === 0,
    });

    await newCard.save();

    return res.status(201).json({ message: "Payment method saved", card: newCard });
  } catch (error) {
    console.log("addMyPaymentMethod error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE (por ahora solo se usa para marcar una tarjeta como principal)
paymentMethodController.updateMyPaymentMethod = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const { isPrimary } = req.body;

    const card = await paymentMethodModel.findOne({ _id: req.params.id, customer_id });

    if (!card) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    if (isPrimary) {
      await paymentMethodModel.updateMany({ customer_id }, { isPrimary: false });
    }

    card.isPrimary = Boolean(isPrimary);
    await card.save();

    return res.status(200).json({ message: "Payment method updated", card });
  } catch (error) {
    console.log("updateMyPaymentMethod error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE de una tarjeta del cliente logueado
paymentMethodController.deleteMyPaymentMethod = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const deletedCard = await paymentMethodModel.findOneAndDelete({
      _id: req.params.id,
      customer_id,
    });

    if (!deletedCard) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    if (deletedCard.isPrimary) {
      const nextCard = await paymentMethodModel.findOne({ customer_id }).sort({ createdAt: 1 });
      if (nextCard) {
        nextCard.isPrimary = true;
        await nextCard.save();
      }
    }

    return res.status(200).json({ message: "Payment method deleted" });
  } catch (error) {
    console.log("deleteMyPaymentMethod error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default paymentMethodController;
