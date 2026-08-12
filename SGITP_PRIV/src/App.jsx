import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";

import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import VerifyCodePage from "./pages/auth/VerifyCodePage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import InventoryPage from "./pages/inventory/InventoryPage";
import PointOfSalePage from "./pages/pos/PointOfSalePage";
import SalesHistoryPage from "./pages/sales/SalesHistoryPage";
import EmployeesPage from "./pages/employees/EmployeesPage";
import PayrollPage from "./pages/payroll/PayrollPage";
import ClientsPage from "./pages/clients/ClientsPage";
import BranchesPage from "./pages/branches/BranchesPage";
import PromotionsPage from "./pages/promotions/PromotionsPage";
import ExpensesPage from "./pages/expenses/ExpensesPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import usePageTitle from "./hooks/usePageTitle";

const PAGE_TITLES = {
  "/": "Iniciar sesion",
  "/forgot-password": "Recuperar contrasena",
  "/verify-code": "Verificar codigo",
  "/reset-password": "Restablecer contrasena",
  "/dashboard": "Dashboard",
  "/inventory": "Inventario",
  "/point-of-sale": "Punto de venta",
  "/sales-history": "Historial de ventas",
  "/employees": "Empleados",
  "/payroll": "Nomina",
  "/clients": "Clientes",
  "/branches": "Sucursales",
  "/promotions": "Promociones",
  "/expenses": "Gastos",
};

function AppRoutes({ theme, onToggleTheme }) {
  const location = useLocation();
  usePageTitle(PAGE_TITLES[location.pathname] ?? "Pagina no encontrada");

  return (
    <Routes>
      {/* Rutas publicas del flujo de autenticacion. */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-code" element={<VerifyCodePage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

      {/* Rutas privadas: ProtectedRoute valida cookie, tipo de usuario y rol. */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage theme={theme} onToggleTheme={onToggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <InventoryPage theme={theme} onToggleTheme={onToggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/point-of-sale"
        element={
          <ProtectedRoute>
            <PointOfSalePage theme={theme} onToggleTheme={onToggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-history"
        element={
          <ProtectedRoute>
            <SalesHistoryPage theme={theme} onToggleTheme={onToggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <EmployeesPage theme={theme} onToggleTheme={onToggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll"
        element={
          <ProtectedRoute>
            <PayrollPage theme={theme} onToggleTheme={onToggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientsPage theme={theme} onToggleTheme={onToggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/branches"
        element={
          <ProtectedRoute>
            <BranchesPage theme={theme} onToggleTheme={onToggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/promotions"
        element={
          <ProtectedRoute>
            <PromotionsPage theme={theme} onToggleTheme={onToggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <ExpensesPage theme={theme} onToggleTheme={onToggleTheme} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <NotFoundPage privateArea />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    // The admin shell stores theme state at body level so every route and modal
    // can inherit the same light/dark token set without prop drilling CSS values.
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(
      theme === "dark" ? "theme-dark" : "theme-light"
    );
  }, [theme]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton duration={2500} />
      <AppRoutes theme={theme} onToggleTheme={toggleTheme} />
    </BrowserRouter>
  );
}

export default App;
