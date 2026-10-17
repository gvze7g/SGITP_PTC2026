//array de funciones
const salesController = {};

//importo la colección que voy a ocupar
import salesModel from "../Model/sales.js";
import cartModel from "../Model/shopping_cart.js";
import { reserveStock } from "../utils/inventory.js";
import { CACHE_KEYS, cached, invalidateCache } from "../utils/cache.js";
import { toCatalogProduct } from "../utils/pricing.js";
import { isPositiveInteger, isValidObjectId } from "../utils/validators.js";

const PRICE_TYPES = ["Retail", "Wholesale"];

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
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// Productos mas vendidos para mostrar tendencias en la web publica.
// Solo cuentan ventas realmente confirmadas: una venta en carrito, pendiente,
// cancelada o fallida nunca debe sumar aqui. El POS (SGITP_PRIV) marca sus
// ventas como "Pagado" (en espanol); el checkout web usa "Paid" en ingles.
// Se aceptan ambas para no dejar fuera las ventas reales de tienda fisica.
const CONFIRMED_PAYMENT_STATUS = /^(paid|pagad[oa])$/i;

salesController.getBestSellers = async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 10) : 5;

    // El ranking cambia poco: se recalcula como mucho una vez por minuto.
    const products = await cached(`${CACHE_KEYS.bestSellers}${limit}`, 60 * 1000, () => salesModel.aggregate([
      { $match: { payment_status: CONFIRMED_PAYMENT_STATUS } },
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
    ]));

    // Mismo formato que el catálogo: sin "cost" salvo para el mayorista.
    return res
      .status(200)
      .json(products.map((product) => toCatalogProduct(product, req.customerType)));
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
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
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
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

    if (!Array.isArray(item_details) || item_details.length === 0) {
      return res.status(400).json({ message: "Agrega al menos un producto a la venta" });
    }

    for (const item of item_details) {
      if (!isValidObjectId(item?.product_id)) {
        return res.status(400).json({ message: "Hay un producto inválido en la venta" });
      }
      if (!isPositiveInteger(item?.quantity)) {
        return res.status(400).json({ message: "Cada producto debe tener una cantidad entera mayor que 0" });
      }
      if (!(Number(item?.unit_price) >= 0)) {
        return res.status(400).json({ message: "Cada producto debe tener un precio válido" });
      }
    }

    if (applied_price_type && !PRICE_TYPES.includes(applied_price_type)) {
      return res.status(400).json({ message: "Tipo de precio inválido" });
    }

    if (shipping_phone && String(shipping_phone).length > 20) {
      return res.status(400).json({ message: "El teléfono no puede pasar de 20 caracteres" });
    }

    if (shipping_address && String(shipping_address).length > 200) {
      return res.status(400).json({ message: "La dirección no puede pasar de 200 caracteres" });
    }

    if (shipping_cost !== undefined && !(Number(shipping_cost) >= 0)) {
      return res.status(400).json({ message: "El costo de envío debe ser un número positivo" });
    }

    // El POS ya bloquea vender más de lo que hay, pero se vuelve a revisar
    // aquí: entre que el cajero armó la orden y confirmó, otra venta (web o
    // app) pudo llevarse esas mismas unidades.
    const stock = await reserveStock(item_details);
    if (!stock.ok) {
      return res.status(400).json({ message: stock.message });
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

    try {
      await newSales.save();
      invalidateCache(CACHE_KEYS.bestSellers);
    } catch (saveError) {
      await stock.restore();
      throw saveError;
    }

    return res.status(201).json({ message: "Venta registrada", sale: newSales });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

//ELIMINAR
salesController.deleteSales = async (req, res) => {
  try {
    const deleteSales = await salesModel.findByIdAndDelete(req.params.id);
    invalidateCache(CACHE_KEYS.bestSellers);

    //Validación por si no fue borrada la marca
    if (!deleteSales) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    return res.status(200).json({ message: "Venta eliminada" });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
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
    invalidateCache(CACHE_KEYS.bestSellers);
    const updatedSales = await salesModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true },
    );

    //si no se actualiza
    if (!updatedSales) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    return res.status(200).json({ message: "Venta actualizada", sale: updatedSales });
  } catch (error) {
    console.log("Error" + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default salesController;
