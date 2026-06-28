import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(
      theme === "dark" ? "theme-dark" : "theme-light"
    );
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/verify-code" element={<VerifyCodePage />} />

        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/dashboard"
          element={
            <DashboardPage
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/inventory"
          element={
            <InventoryPage
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/point-of-sale"
          element={
            <PointOfSalePage
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/sales-history"
          element={
            <SalesHistoryPage
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/employees"
          element={
            <EmployeesPage
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/payroll"
          element={
            <PayrollPage
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/clients"
          element={
            <ClientsPage
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/branches"
          element={
            <BranchesPage
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/promotions"
          element={
            <PromotionsPage
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/expenses"
          element={
            <ExpensesPage
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;