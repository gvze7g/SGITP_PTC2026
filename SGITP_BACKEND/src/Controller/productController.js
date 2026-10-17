import productsModel from "../Model/products.js";
import { CACHE_KEYS, cached, invalidateCache } from "../utils/cache.js";
import { cloudinary } from "../utils/cloudinaryConfig.js";
import { getTotalStock } from "../utils/inventory.js";
import { decorateWithOfferPricing, toCatalogProduct } from "../utils/pricing.js";
import { PRODUCT_CATEGORY_GROUPS, isValidCategory } from "../utils/productCategories.js";
import { isValidObjectId } from "../utils/validators.js";
import { toDateString, toStoredDate, validateValidityDates } from "../utils/dates.js";

const productController = {};

const uploadBufferToCloudinary = (buffer, folder = "SGITP_BACKEND/products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

// ---------- Validación del producto (crear/editar desde el panel) ----------
// Son las mismas reglas que aplica CreateProductModal en SGITP_PRIV, repetidas
// aquí para que nadie pueda saltárselas llamando a la API directamente.

const PRODUCT_NAME_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9 ]+$/;
const VARIANT_SIZE_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 -]+$/;
const VARIANT_TEXT_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9 ]*$/;
const COLOR_HEX_PATTERN = /^#[0-9a-f]{6}$/i;
const MAX_PRICE = 100000;
const MAX_STOCK = 100000;
const MAX_VARIANTS = 50;
const MAX_DESCRIPTION_LENGTH = 1000;

class ProductValidationError extends Error {}

const fail = (message) => {
  throw new ProductValidationError(message);
};

const parseJsonField = (value, label) => {
  if (value === undefined || value === null || value === "") return [];
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fail(`El formato de ${label} no es válido`);
  }
};

const parsePrice = (value, label) => {
  const raw = String(value ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    fail(`${label} debe ser un número válido con máximo 2 decimales`);
  }

  const price = Number(raw);
  if (!(price > 0) || price > MAX_PRICE) {
    fail(`${label} debe ser mayor que 0 y menor que ${MAX_PRICE}`);
  }

  return price;
};

const cleanVariantText = (value, label, index) => {
  const text = String(value ?? "").trim();
  if (text.length > 40) fail(`${label} de la variante ${index + 1} no puede pasar de 40 caracteres`);
  if (!VARIANT_TEXT_PATTERN.test(text)) {
    fail(`${label} de la variante ${index + 1} solo puede tener letras, números y espacios`);
  }
  return text;
};

const parseVariants = (value) => {
  const variants = parseJsonField(value, "las variantes");

  if (!Array.isArray(variants) || variants.length === 0) {
    fail("El producto debe tener al menos una variante");
  }

  if (variants.length > MAX_VARIANTS) {
    fail(`El producto no puede tener más de ${MAX_VARIANTS} variantes`);
  }

  const seen = new Set();

  return variants.map((variant, index) => {
    const size = String(variant?.size ?? "").trim();
    if (!size) fail(`La variante ${index + 1} debe tener una talla`);
    if (size.length > 20 || !VARIANT_SIZE_PATTERN.test(size)) {
      fail(`La talla de la variante ${index + 1} solo puede tener letras, números, espacios y guion`);
    }

    const color = cleanVariantText(variant?.color, "El color", index);
    const stockRaw = String(variant?.stock ?? "").trim();
    if (!/^\d+$/.test(stockRaw) || Number(stockRaw) > MAX_STOCK) {
      fail(`El stock de la variante ${index + 1} debe ser un número entero entre 0 y ${MAX_STOCK}`);
    }

    const colorHex = String(variant?.colorHex ?? "").trim();
    if (colorHex && !COLOR_HEX_PATTERN.test(colorHex)) {
      fail(`El tono de la variante ${index + 1} no es un color válido`);
    }

    const key = `${size.toLowerCase()}|${color.toLowerCase()}`;
    if (seen.has(key)) {
      fail(`Hay variantes repetidas con la talla "${size}"${color ? ` y color "${color}"` : ""}`);
    }
    seen.add(key);

    return {
      size,
      color,
      colorHex: colorHex || "#000000",
      design: cleanVariantText(variant?.design, "El diseño", index),
      embroidery: cleanVariantText(variant?.embroidery, "El bordado", index),
      fabric: cleanVariantText(variant?.fabric, "La tela", index),
      stock: String(Number(stockRaw)),
    };
  });
};

const parseOffers = (value, previousOffer = null) => {
  const offers = parseJsonField(value, "la oferta");
  if (!Array.isArray(offers)) fail("El formato de la oferta no es válido");
  if (offers.length > 1) fail("El producto solo puede tener una oferta a la vez");

  return offers.map((offer) => {
    const discount = Number(offer?.value);
    if (!Number.isFinite(discount) || discount <= 0 || discount >= 100) {
      fail("El descuento de la oferta debe ser mayor que 0 y menor que 100");
    }

    // Las fechas son opcionales, pero si vienen no pueden ser anteriores a
    // hoy (salvo que sean las mismas que ya tenía al editar).
    const datesError = validateValidityDates(
      { start: offer?.startDate, end: offer?.endDate },
      {
        previousStart: previousOffer?.startDate,
        previousEnd: previousOffer?.endDate,
        requireBoth: false,
        label: "la oferta",
      }
    );
    if (datesError) fail(datesError);

    const startDate = toDateString(offer?.startDate);
    const endDate = toDateString(offer?.endDate);

    return {
      value: discount,
      startDate: startDate ? toStoredDate(startDate) : null,
      endDate: endDate ? toStoredDate(endDate) : null,
      active: offer?.active !== false,
    };
  });
};

const parseProductBody = (body = {}, previousProduct = null) => {
  const name = String(body.name ?? "").trim();
  if (name.length < 3 || name.length > 80) fail("El nombre del producto debe tener entre 3 y 80 caracteres");
  if (!PRODUCT_NAME_PATTERN.test(name)) fail("El nombre del producto solo puede tener letras, números y espacios");

  const description = String(body.description ?? "").trim();
  if (!description) fail("La descripción del producto es obligatoria");
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    fail(`La descripción no puede pasar de ${MAX_DESCRIPTION_LENGTH} caracteres`);
  }

  const category = String(body.category ?? "").trim();
  if (!isValidCategory(category)) fail("Selecciona una categoría válida de la lista");

  const price = parsePrice(body.price, "El precio para cliente regular");
  const cost = parsePrice(body.cost, "El precio mayorista");
  if (cost > price) fail("El precio mayorista no puede ser mayor que el precio regular");

  return {
    name,
    description,
    category,
    price,
    cost,
    variants: parseVariants(body.variants),
    offers: parseOffers(body.offers, previousProduct?.offers?.[0]),
  };
};

const handleProductError = (res, error, label) => {
  if (error instanceof ProductValidationError) {
    return res.status(400).json({ message: error.message });
  }

  console.log(`${label} error: ` + error);
  return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
};

// Catálogo completo (documentos planos) compartido por las rutas públicas.
// Dura poco porque el stock cambia con cada venta; igual se invalida al
// editar productos o vender.
const CATALOG_TTL_MS = 15 * 1000;
const getCachedCatalog = () =>
  cached(`${CACHE_KEYS.catalog}all`, CATALOG_TTL_MS, () => productsModel.find().lean());

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------- Panel de administración ----------

// GET ALL
productController.getProducts = async (req, res) => {
  try {
    const products = await productsModel.find().lean();
    return res.status(200).json(products);
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// GET BY ID
productController.getProductById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(decorateWithOfferPricing(product));
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// ---------- Tienda pública (web y app móvil) ----------
// Pasan por attachCustomerType: el mayorista recibe wholesalePrice, el resto
// nunca recibe "cost".

productController.getCatalogProducts = async (req, res) => {
  try {
    const products = await getCachedCatalog();
    return res.status(200).json(products.map((product) => toCatalogProduct(product, req.customerType)));
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

productController.getCatalogProductById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(toCatalogProduct(product, req.customerType));
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// Lista cerrada de categorías para el selector del panel y los filtros.
productController.getCategories = (req, res) => {
  return res.status(200).json(PRODUCT_CATEGORY_GROUPS);
};

// Productos con oferta activa vigente, para la seccion "Ofertas" de la web publica
productController.getOfferProducts = async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 20) : 8;

    // Pre-filtro barato en Mongo (cualquier oferta marcada activa); la fecha
    // exacta y el orden final se resuelven en JS con la misma logica que
    // el detalle, para que el precio mostrado nunca quede inconsistente.
    const candidates = (await getCachedCatalog()).filter((product) =>
      (product.offers || []).some((offer) => offer?.active)
    );

    const productsWithOffer = candidates
      .map((product) => toCatalogProduct(product, req.customerType))
      .filter((product) => product.hasActiveOffer)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)
      .slice(0, limit);

    return res.status(200).json(productsWithOffer);
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// SEARCH BY NAME
productController.searchByName = async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim().slice(0, 80);

    // Se escapa el texto: sin esto, buscar "(" o ".*" se interpretaba como
    // expresión regular y podía tumbar la consulta.
    const products = await productsModel.find({
      name: { $regex: escapeRegex(name), $options: "i" },
    });

    return res.status(200).json(products);
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// FILTER BY PRICE RANGE
productController.getProductsByPriceRange = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.body;
    const hasMin = minPrice !== undefined && minPrice !== null && minPrice !== "";
    const hasMax = maxPrice !== undefined && maxPrice !== null && maxPrice !== "";

    if ((hasMin && !(Number(minPrice) >= 0)) || (hasMax && !(Number(maxPrice) >= 0))) {
      return res.status(400).json({ message: "Los precios del filtro deben ser números positivos" });
    }

    if (hasMin && hasMax && Number(minPrice) > Number(maxPrice)) {
      return res.status(400).json({ message: "El precio mínimo no puede ser mayor que el máximo" });
    }

    const filters = {};

    if (hasMin || hasMax) {
      filters.price = {};
      if (hasMin) filters.price.$gte = Number(minPrice);
      if (hasMax) filters.price.$lte = Number(maxPrice);
    }

    const products = await productsModel.find(filters);

    return res.status(200).json(products);
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// LOW STOCK
productController.getLowStock = async (req, res) => {
  try {
    const requested = Number.parseInt(req.query.threshold, 10);
    const threshold = Number.isFinite(requested) && requested >= 0 ? requested : 5;

    const products = await productsModel.find().lean();

    const lowStockProducts = products.filter((product) => {
      const totalStock = getTotalStock(product.variants);
      return totalStock <= threshold;
    });

    return res.status(200).json(lowStockProducts);
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// COUNT PRODUCTS
productController.countProducts = async (req, res) => {
  try {
    const totalProducts = await productsModel.countDocuments();

    const products = await productsModel.find().select("variants").lean();

    const lowStockCount = products.filter((product) => {
      const totalStock = getTotalStock(product.variants);
      return totalStock <= 5;
    }).length;

    return res.status(200).json({
      totalProducts,
      lowStockCount,
    });
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// INSERT
productController.insertProducts = async (req, res) => {
  try {
    const productData = parseProductBody(req.body);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Debes subir al menos una imagen del producto" });
    }

    const uploadedImages = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer))
    );

    const imagesArray = uploadedImages.map((image) => ({
      image: image.secure_url,
      public_id: image.public_id,
    }));

    const newProduct = new productsModel({
      ...productData,
      images: imagesArray,
    });

    await newProduct.save();
    invalidateCache(CACHE_KEYS.catalog);
    invalidateCache(CACHE_KEYS.bestSellers);

    return res.status(201).json({
      message: "Producto guardado correctamente",
      product: newProduct,
    });
  } catch (error) {
    return handleProductError(res, error, "insertProducts");
  }
};

// UPDATE
productController.updateProducts = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Se valida antes de tocar Cloudinary, para no borrar las fotos de un
    // producto cuando el resto de los datos venía mal.
    const productData = parseProductBody(req.body, product);

    let imagesArray = product.images || [];

    if (req.files && req.files.length > 0) {
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }
      }

      const uploadedImages = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file.buffer))
      );

      imagesArray = uploadedImages.map((image) => ({
        image: image.secure_url,
        public_id: image.public_id,
      }));
    }

    const updatedProduct = await productsModel.findByIdAndUpdate(
      req.params.id,
      {
        ...productData,
        images: imagesArray,
      },
      { new: true }
    );
    invalidateCache(CACHE_KEYS.catalog);
    invalidateCache(CACHE_KEYS.bestSellers);

    return res.status(200).json({
      message: "Producto actualizado correctamente",
      product: updatedProduct,
    });
  } catch (error) {
    return handleProductError(res, error, "updateProducts");
  }
};

// DELETE
productController.deleteProducts = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    await productsModel.findByIdAndDelete(req.params.id);
    invalidateCache(CACHE_KEYS.catalog);
    invalidateCache(CACHE_KEYS.bestSellers);

    return res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default productController;
