// array de funciones
const promotionsController = {};

// importo la colección que voy a ocupar
import promotionsModel from "../Model/promotions.js";

//SELECT
promotionsController.getPromotions = async (req, res) => {
  try {
    const promotions = await promotionsModel.find();
    return res.status(200).json(promotions);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//INSERTAR
promotionsController.insertPromotions = async (req, res) => {
  try {
    //#1- solicito los datos a guardar
    let { coupon_code, descriptions, discount_percentage, start_date, end_date, isActive } = req.body;

    //#2- Validaciones de coupon_code
    coupon_code = coupon_code?.trim();

    if (!coupon_code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(coupon_code)) {
      return res.status(400).json({ message: "Coupon code must only contain letters and numbers" });
    }

    //#3- Validaciones de Fechas
    if (!start_date || !end_date) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end <= start) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    //#4- Lógica de Activación Dinámica
    let statusFinal = isActive !== undefined ? isActive : true;

    // Si el usuario lo quiere activo, el servidor valida si realmente está en el rango de fechas actual
    if (statusFinal === true) {
      if (now < start || now > end) {
        statusFinal = false; 
      }
    }

    //Guardo en la base de datos de promociones
    const newPromotion = new promotionsModel({
      coupon_code, 
      descriptions, 
      discount_percentage, 
      start_date: start, 
      end_date: end, 
      isActive: statusFinal 
    });
    
    await newPromotion.save();

    return res.status(201).json({ message: "Promotion saved", data: newPromotion });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ELIMINAR
promotionsController.deletePromotions = async (req, res) => {
  try {
    const deletePromotion = await promotionsModel.findByIdAndDelete(req.params.id);

    if (!deletePromotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    return res.status(200).json({ message: "Promotion deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ACTUALIZAR
promotionsController.updatePromotions = async (req, res) => {
  try {
    // Pedimos los nuevos datos
    let { coupon_code, descriptions, discount_percentage, start_date, end_date, isActive } = req.body;
    
    //#1- Validaciones de coupon_code (si es que se envía en el update)
    if (coupon_code !== undefined) {
      coupon_code = coupon_code?.trim();
      
      if (!coupon_code) {
        return res.status(400).json({ message: "Coupon code cannot be empty" });
      }

      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      if (!alphanumericRegex.test(coupon_code)) {
        return res.status(400).json({ message: "Coupon code must only contain letters and numbers" });
      }
    }

    //#2- Validaciones de Fechas (si es que se envían en el update)
    if (!start_date || !end_date) {
      return res.status(400).json({ message: "Both start date and end date are required to update periods" });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end <= start) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    //#3- Lógica de Activación Dinámica para la edición
    let statusFinal = isActive !== undefined ? isActive : true;

    if (statusFinal === true) {
      if (now < start || now > end) {
        statusFinal = false; // Se desactiva si el usuario lo pone en true pero las fechas no coinciden con el "hoy"
      }
    }

    // actualizamos la promoción
    const updatedPromotion = await promotionsModel.findByIdAndUpdate(
      req.params.id,
      {
        coupon_code,
        descriptions,
        discount_percentage,
        start_date: start,
        end_date: end,
        isActive: statusFinal
      },
      { new: true },
    );

    if (!updatedPromotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    return res.status(200).json({ message: "Promotion updated", data: updatedPromotion });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default promotionsController;