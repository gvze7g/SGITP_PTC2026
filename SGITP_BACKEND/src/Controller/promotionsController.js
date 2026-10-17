import promotionsModel from "../Model/promotions.js";
import {
  isWithinDateRange,
  toDateString,
  toStoredDate,
  validateValidityDates,
} from "../utils/dates.js";
import { isValidObjectId } from "../utils/validators.js";

// Fechas y porcentaje de un cupón. Devuelve { error } o { start, end, discount }.
// El inicio y el final no pueden ser anteriores a hoy (al editar se acepta
// una fecha que no cambió) y el final debe ser después del inicio.
const parsePromotionPeriod = (body, previous = null) => {
  const error = validateValidityDates(
    { start: body.start_date, end: body.end_date },
    {
      previousStart: previous?.start_date,
      previousEnd: previous?.end_date,
      label: "el cupón",
    }
  );
  if (error) return { error };

  const start = toDateString(body.start_date);
  const end = toDateString(body.end_date);
  if (end <= start) {
    return { error: "La fecha final del cupón debe ser posterior a la fecha de inicio" };
  }

  const discount = Number(body.discount_percentage);
  if (!Number.isFinite(discount) || discount <= 0 || discount >= 100) {
    return { error: "El descuento del cupón debe ser mayor que 0 y menor que 100" };
  }

  return { start: toStoredDate(start), end: toStoredDate(end), discount };
};

const promotionsController = {};

// GET para el carrito del cliente: revisa si un código existe, está activo
// y dentro de su rango de fechas, y devuelve el porcentaje si es válido.
// Nunca expone la lista completa de cupones, solo si ESE código funciona.
promotionsController.validateCoupon = async (req, res) => {
  try {
    const code = req.params.code?.trim();

    if (!code) {
      return res.status(400).json({ message: "El código del cupón es obligatorio" });
    }

    const promotion = await promotionsModel.findOne({
      coupon_code: code,
      isActive: true,
    });

    if (!promotion) {
      return res.status(404).json({ message: "El código de descuento no existe o no está activo" });
    }

    // Se compara por día en hora de El Salvador: el cupón vale todo el día
    // de inicio y todo el día final.
    if (!isWithinDateRange(promotion.start_date, promotion.end_date)) {
      return res.status(404).json({ message: "Este cupón ya venció o todavía no está vigente" });
    }

    return res.status(200).json({
      coupon_code: promotion.coupon_code,
      discount_percentage: promotion.discount_percentage,
      descriptions: promotion.descriptions,
    });
  } catch (error) {
    console.log("validateCoupon error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// GET ALL
promotionsController.getPromotions = async (req, res) => {
  try {
    const promotions = await promotionsModel.find();
    return res.status(200).json(promotions);
  } catch (error) {
    console.log("getPromotions error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// GET BY ID
promotionsController.getPromotionById = async (req, res) => {
  try {
    const promotion = await promotionsModel.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({ message: "Promoción no encontrada" });
    }

    return res.status(200).json(promotion);
  } catch (error) {
    console.log("getPromotionById error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
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
      return res.status(400).json({ message: "El código del cupón es obligatorio" });
    }

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(coupon_code)) {
      return res.status(400).json({
        message: "El código del cupón solo puede tener letras y números",
      });
    }

    if (coupon_code.length > 20) {
      return res.status(400).json({ message: "El código no puede pasar de 20 caracteres" });
    }

    if (await promotionsModel.exists({ coupon_code })) {
      return res.status(400).json({ message: "Ya existe un cupón con ese código" });
    }

    const period = parsePromotionPeriod(req.body);
    if (period.error) {
      return res.status(400).json({ message: period.error });
    }

    const { start, end } = period;

    // isActive es solo el interruptor del admin. Antes se apagaba si hoy no
    // estaba dentro del rango, y como ahora el inicio es a futuro, todo cupón
    // nuevo habría nacido apagado para siempre. La vigencia por fechas se
    // revisa al usarlo (validateCoupon y el checkout).
    const statusFinal = isActive !== undefined ? Boolean(isActive) : true;

    const newPromotion = new promotionsModel({
      coupon_code,
      descriptions,
      discount_percentage: period.discount,
      start_date: start,
      end_date: end,
      isActive: statusFinal,
    });

    await newPromotion.save();

    return res.status(201).json({
      message: "Promoción guardada correctamente",
      promotion: newPromotion,
    });
  } catch (error) {
    console.log("insertPromotion error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
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
        return res.status(400).json({ message: "El código del cupón no puede quedar vacío" });
      }

      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      if (!alphanumericRegex.test(coupon_code)) {
        return res.status(400).json({
          message: "El código del cupón solo puede tener letras y números",
        });
      }
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Promoción no encontrada" });
    }

    const currentPromotion = await promotionsModel.findById(req.params.id);

    if (!currentPromotion) {
      return res.status(404).json({ message: "Promoción no encontrada" });
    }

    if (coupon_code !== undefined) {
      if (coupon_code.length > 20) {
        return res.status(400).json({ message: "El código no puede pasar de 20 caracteres" });
      }

      const duplicated = await promotionsModel.exists({
        coupon_code,
        _id: { $ne: currentPromotion._id },
      });
      if (duplicated) {
        return res.status(400).json({ message: "Ya existe un cupón con ese código" });
      }
    }

    const period = parsePromotionPeriod(req.body, currentPromotion);
    if (period.error) {
      return res.status(400).json({ message: period.error });
    }

    const { start, end } = period;
    const statusFinal = isActive !== undefined ? Boolean(isActive) : currentPromotion.isActive;

    const updatedPromotion = await promotionsModel.findByIdAndUpdate(
      req.params.id,
      {
        coupon_code,
        descriptions,
        discount_percentage: period.discount,
        start_date: start,
        end_date: end,
        isActive: statusFinal,
      },
      { new: true }
    );

    if (!updatedPromotion) {
      return res.status(404).json({ message: "Promoción no encontrada" });
    }

    return res.status(200).json({
      message: "Promoción actualizada correctamente",
      promotion: updatedPromotion,
    });
  } catch (error) {
    console.log("updatePromotion error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// DELETE
promotionsController.deletePromotion = async (req, res) => {
  try {
    const deletedPromotion = await promotionsModel.findByIdAndDelete(req.params.id);

    if (!deletedPromotion) {
      return res.status(404).json({ message: "Promoción no encontrada" });
    }

    return res.status(200).json({ message: "Promoción eliminada correctamente" });
  } catch (error) {
    console.log("deletePromotion error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default promotionsController;