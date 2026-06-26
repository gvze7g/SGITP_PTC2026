import express from "express";
import BranchesRoutes from "./src/Routes/branches.js";
import customerRoutes from "./src/Routes/customer.js";
import registerCustomerRoutes from "./src/Routes/registerCustomer.js"
import employeeRoutes from "./src/Routes/employee.js"
import registerEmployeeRoutes from "./src/Routes/registerEmployee.js"
import paymentRoutes from "./src/Routes/payment.js";
import productsRoutes from "./src/Routes/products.js"
import cookieParser from "cookie-parser";

import cors from "cors";
//import { validateAuthCookie } from "./src/Middlewares/authMiddleware.js";



const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    // permitir el envio de cookies y credenciales
    credentials: true,
  }),
);

app.use(cookieParser());

//Que acepte JSON desde postman
app.use(express.json());

app.use("/api/branches", BranchesRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/registerCustomer", registerCustomerRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/registerEmployee", registerEmployeeRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/products", productsRoutes);


export default app;