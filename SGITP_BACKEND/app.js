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
import limiter from "./src/Middlewares/rateLimiter.js";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./src/utils/itr-32d-SIGTP_EXPO-1-resolved.json" with { type: "json" };

import { validateAuthCookie } from "./src/Middlewares/authMiddleware.js";

const app = express();

// Origenes extra para produccion o para el celular en la red local.
// Se configuran en el .env separados por coma, ej:
// CORS_ORIGINS=https://peques.com,http://192.168.0.20:8081
const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  ...envOrigins,
]);

const isLocalViteOrigin = (origin = "") =>
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

// Expo en el celular pega al backend usando la IP de la LAN (192.168.x.x,
// 10.x.x.x, 172.16-31.x.x). Sin esto el navegador de Expo Web y algunos
// clientes nativos reciben error de CORS al usar credentials: 'include'.
const isPrivateNetworkOrigin = (origin = "") =>
  /^https?:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
    origin
  );

app.use(
  cors({
    origin(origin, callback) {
      // Las apps nativas (React Native, Postman) no mandan Origin: se permiten.
      if (
        !origin ||
        allowedOrigins.has(origin) ||
        isLocalViteOrigin(origin) ||
        isPrivateNetworkOrigin(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(limiter);

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

// Manejador de errores global. Sin esto, cuando multer rechaza un archivo
// (muy pesado, formato invalido, campo con otro nombre) Express responde con
// una pagina HTML de error; el frontend hace response.json(), eso revienta y
// el usuario solo ve "Error de conexion con el servidor" sin saber la causa.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: "La imagen es demasiado pesada. El maximo permitido es 5 MB.",
    });
  }

  if (error?.code === "LIMIT_FILE_COUNT") {
    return res.status(413).json({
      message: "Demasiadas imagenes. El maximo permitido son 5 por producto.",
    });
  }

  if (error?.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      message:
        "El campo de archivos no coincide. El backend espera que las imagenes se manden en el campo 'images'.",
    });
  }

  if (error?.code === "INVALID_FILE_TYPE") {
    return res.status(415).json({ message: error.message });
  }

  if (error?.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origen no permitido por CORS" });
  }

  console.error("Unhandled error:", error);

  return res.status(error?.statusCode || 500).json({
    message: error?.message || "Internal server error",
  });
});

export default app;
