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
import loginCustomerRoutes from "./src/Routes/loginCustomer.js";
import loginEmployeeRoutes from "./src/Routes/loginemployee.js";
import logoutRoutes from "./src/Routes/logout.js";
import recoveryPasswordRoutes from "./src/Routes/recoveryPassword.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

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
app.use("/api/loginCustomer", loginCustomerRoutes);
app.use("/api/loginEmployee", loginEmployeeRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/recoveryPassword", recoveryPasswordRoutes);

export default app;