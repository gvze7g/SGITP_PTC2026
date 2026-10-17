import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./src/Routes/auth.js";
import BranchesRoutes from "./src/Routes/branches.js";
import customerRoutes from "./src/Routes/customer.js";
import registerCustomerRoutes from "./src/Routes/registerCustomer.js";
import employeeRoutes from "./src/Routes/employee.js";
import registerEmployeeRoutes from "./src/Routes/registerEmployee.js";
import paymentRoutes from "./src/Routes/payment.js";
import productsRoutes from "./src/Routes/products.js";
import promotionsRoutes from "./src/Routes/promotions.js";
import salesRoutes from "./src/Routes/sales.js";
import cartRoutes from "./src/Routes/shopping_cart.js";
import spentRoutes from "./src/Routes/spent.js";
import posRoutes from "./src/Routes/pos.js";
import payrollRoutes from "./src/Routes/payroll.js";
import favoritesRoutes from "./src/Routes/favorite.js"
import paymentMethodRoutes from "./src/Routes/paymentMethod.js"
import loginCustomerRoutes from "./src/Routes/loginCustomer.js";
import loginEmployeeRoutes from "./src/Routes/loginEmployee.js";
import logoutRoutes from "./src/Routes/logout.js";
import wompiRoutes from "./src/Routes/wompi.js"
import recoveryPasswordRoutes from "./src/Routes/recoveryPassword.js";
import limiter, { authLimiter } from "./src/Middlewares/rateLimiter.js";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./src/utils/itr-32d-SIGTP_EXPO-1-resolved.json" with { type: "json" };

const app = express();

// En Render las peticiones llegan a través de un proxy. Sin esto, Express ve
// la IP del proxy en lugar de la del visitante y TODOS los usuarios
// compartían un mismo límite de solicitudes: con pocos usuarios navegando la
// tienda dejaba de responder ("Demasiadas solicitudes").
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS ?? 1));

// ALLOWED_ORIGINS (opcional, separado por comas) deja agregar el dominio real
// del frontend en producción (Vercel/Netlify/etc) sin tocar código: se
// define como variable de entorno en Render el día que se despliegue.
const extraOrigins = process.env.ALLOWED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean) ?? [];

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  ...extraOrigins,
]);

const isLocalViteOrigin = (origin = "") =>
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || isLocalViteOrigin(origin)) {
        return callback(null, true);
      }

      console.log("CORS rejected origin:", origin, "| allowed:", [...allowedOrigins]);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(cookieParser());
// Tope al tamaño del cuerpo JSON: evita que una petición enorme sature el servidor.
app.use(express.json({ limit: "1mb" }));
app.use(limiter);

// Rutas de acceso con límite estricto contra intentos repetidos.
app.use(
  [
    "/api/loginCustomer",
    "/api/loginEmployee",
    "/api/registerCustomer",
    "/api/registerEmployee/verifyCodeEmail",
    "/api/recoveryPassword",
    "/api/auth/google",
  ],
  authLimiter
);

app.get("/", (req, res) => {
  res.json({ message: "SGITP_BACKEND running" });
});

app.use("/api/auth", authRoutes);

app.use("/api/branches", BranchesRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/registerCustomer", registerCustomerRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/registerEmployee", registerEmployeeRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/promotions", promotionsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/spent", spentRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/favorite", favoritesRoutes);
app.use("/api/paymentMethod", paymentMethodRoutes);
app.use("/api/loginCustomer", loginCustomerRoutes);
app.use("/api/loginEmployee", loginEmployeeRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/wompi", wompiRoutes);
app.use("/api/recoveryPassword", recoveryPasswordRoutes);

// Ruta de la documentación
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ruta que no existe: respuesta JSON en vez de la página HTML de Express.
app.use((req, res) => {
  res.status(404).json({ message: "La ruta solicitada no existe" });
});

// Manejo central de errores: un JSON mal formado, un archivo demasiado grande
// o un origen no permitido responden con un mensaje claro en lugar de un 500
// genérico, y ningún error inesperado deja la petición colgada.
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Los datos enviados no tienen un formato válido" });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Los datos enviados son demasiado grandes" });
  }

  if (error.name === "MulterError") {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Una de las imágenes es demasiado pesada"
        : error.code === "INVALID_FILE_TYPE"
          ? "Solo se permiten imágenes (JPG, PNG, WEBP, GIF o AVIF)"
          : error.code === "LIMIT_UNEXPECTED_FILE" || error.code === "LIMIT_FILE_COUNT"
            ? "Se enviaron más imágenes de las permitidas"
            : "No se pudieron procesar las imágenes";
    return res.status(400).json({ message });
  }

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origen no permitido" });
  }

  console.error("Error no controlado:", error);
  return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
});

export default app;
