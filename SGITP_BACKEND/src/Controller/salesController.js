//array de funciones
const salesController = {};

//importo la colección que voy a ocupar
import salesModel from "../Model/sales.js";
import cartModel from "../Model/shopping_cart.js";
import productsModel from "../Model/products.js";

// Descuenta el stock de la variante vendida (usado por ventas creadas en el POS)
const discountVariantsStock = async (itemDetails = []) => {
  for (const item of itemDetails) {
    if (!item?.product_id) continue;

    const product = await productsModel.findById(item.product_id);
    if (!product || !Array.isArray(product.variants)) continue;

    const variant =
      product.variants.find(
        (v) => v.size === item.variant_size && v.color === item.variant_color
      ) || product.variants[0];

    if (!variant) continue;

    const currentStock = Number(variant.stock || 0);
    const soldQty = Number(item.quantity || 0);
    variant.stock = String(Math.max(0, currentStock - soldQty));

    await product.save();
  }
};

//SELECT
salesController.getSales = async (req, res) => {
  try {
    const sales = await salesModel
      .find()
      .populate({
        path: "cart_id",
        select: "customerId",
        populate: { path: "customerId", select: "full_name customer_type email" },
      })
      .populate({
        path: "employee_id",
        select: "full_name branch_id",
        populate: { path: "branch_id", select: "name" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(sales);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Productos mas vendidos para mostrar tendencias en la web publica
salesController.getBestSellers = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 5), 10);

    const products = await salesModel.aggregate([
      { $unwind: "$item_details" },
      {
        $match: {
          "item_details.product_id": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$item_details.product_id",
          totalSold: { $sum: { $ifNull: ["$item_details.quantity", 1] } },
          lastSaleDate: { $max: "$createdAt" },
        },
      },
      { $sort: { totalSold: -1, lastSaleDate: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$product",
              {
                totalSold: "$totalSold",
                lastSaleDate: "$lastSaleDate",
              },
            ],
          },
        },
      },
    ]);

    return res.status(200).json(products);
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// SELECT pedidos del cliente autenticado
salesController.getMySales = async (req, res) => {
  try {
    const carts = await cartModel.find({ customerId: req.user.id }).select("_id");
    const cartIds = carts.map((cart) => cart._id);

    const sales = await salesModel
      .find({ cart_id: { $in: cartIds } })
      .populate("item_details.product_id", "name images category price variants")
      .sort({ createdAt: -1 });

    return res.status(200).json(sales);
  } catch (error) {
    console.log("getMySales error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//INSERTAR
salesController.insertSales = async (req, res) => {
  try {
    //#1- solicito los datos a guardar
    let { employee_id, cart_id, origin, applied_price_type, payment_method, payment_status, shipping_address, shipping_phone, shipping_method, shipping_cost, item_details } = req.body;

    if (!employee_id && req.user?.userType === "Employee") {
      employee_id = req.user.id;
    }

    //Guardo en la base de datos
    const newSales = new salesModel({
      sales_date: new Date(),
      employee_id,
      cart_id,
      origin,
      applied_price_type,
      payment_method,
      payment_status,
      shipping_address,
      shipping_phone,
      shipping_method,
      shipping_cost,
      item_details,
    });
    await newSales.save();
    await discountVariantsStock(item_details);

    return res.status(201).json({ message: "Sales saved", sale: newSales });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ELIMINAR
salesController.deleteSales = async (req, res) => {
  try {
    const deleteSales = await salesModel.findByIdAndDelete(req.params.id);

    //Validación por si no fue borrada la marca
    if (!deleteSales) {
      return res.status(404).json({ message: "sales not found" });
    }

    return res.status(200).json({ message: "sales deleted" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ACTUALIZAR
salesController.updateSales = async (req, res) => {
  try {
    //Pedimos los nuevos datos: solo se actualizan los campos que vienen en el body
    const allowedFields = [
      "employee_id",
      "cart_id",
      "origin",
      "applied_price_type",
      "payment_method",
      "payment_status",
      "shipping_address",
      "shipping_phone",
      "item_details",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    //actualizamos
    const updatedSales = await salesModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true },
    );

    //si no se actualiza
    if (!updatedSales) {
      return res.status(404).json({ message: "sales not found" });
    }

    return res.status(200).json({ message: "sales updated", sale: updatedSales });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default salesController;
