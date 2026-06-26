import { useEffect, useState } from 'react';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyCodePage from './pages/auth/VerifyCodePage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import InventoryPage from './pages/inventory/InventoryPage';
import PointOfSalePage from './pages/pos/PointOfSalePage';
import SalesHistoryPage from './pages/sales/SalesHistoryPage';
import EmployeesPage from './pages/employees/EmployeesPage';
import PayrollPage from './pages/payroll/PayrollPage';
import ClientsPage from './pages/clients/ClientsPage';
import BranchesPage from './pages/branches/BranchesPage';
import PromotionsPage from './pages/promotions/PromotionsPage';
import ExpensesPage from './pages/expenses/ExpensesPage';

const VIEWS = {
  LOGIN: 'login',
  FORGOT_PASSWORD: 'forgot-password',
  VERIFY_CODE: 'verify-code',
  RESET_PASSWORD: 'reset-password',
  DASHBOARD: 'dashboard',
  INVENTORY: 'inventory',
  POS: 'point-of-sale',
  SALES_HISTORY: 'sales-history',
  EMPLOYEES: 'employees',
  PAYROLL: 'payroll',
  CLIENTS: 'clients',
  BRANCHES: 'branches',
  PROMOTIONS: 'promotions',
  EXPENSES: 'expenses',
};

function App() {
  const [currentView, setCurrentView] = useState(VIEWS.LOGIN);
  const [theme, setTheme] = useState('light');

  const goTo = (view) => setCurrentView(view);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  }, [theme]);

  return (
    <>
      {currentView === VIEWS.LOGIN && (
        <LoginPage
          onForgotPassword={() => goTo(VIEWS.FORGOT_PASSWORD)}
          onLogin={() => goTo(VIEWS.DASHBOARD)}
        />
      )}

      {currentView === VIEWS.FORGOT_PASSWORD && (
        <ForgotPasswordPage
          onBackToLogin={() => goTo(VIEWS.LOGIN)}
          onSendCode={() => goTo(VIEWS.VERIFY_CODE)}
        />
      )}

      {currentView === VIEWS.VERIFY_CODE && (
        <VerifyCodePage
          onBackToForgotPassword={() => goTo(VIEWS.FORGOT_PASSWORD)}
          onVerifyCode={() => goTo(VIEWS.RESET_PASSWORD)}
        />
      )}

      {currentView === VIEWS.RESET_PASSWORD && (
        <ResetPasswordPage onVerify={() => goTo(VIEWS.LOGIN)} />
      )}

      {currentView === VIEWS.DASHBOARD && (
        <DashboardPage currentView={currentView} onNavigate={goTo} theme={theme} onToggleTheme={toggleTheme} />
      )}

      {currentView === VIEWS.INVENTORY && (
        <InventoryPage currentView={currentView} onNavigate={goTo} theme={theme} onToggleTheme={toggleTheme} />
      )}

      {currentView === VIEWS.POS && (
        <PointOfSalePage currentView={currentView} onNavigate={goTo} theme={theme} onToggleTheme={toggleTheme} />
      )}

      {currentView === VIEWS.SALES_HISTORY && (
        <SalesHistoryPage currentView={currentView} onNavigate={goTo} theme={theme} onToggleTheme={toggleTheme} />
      )}

      {currentView === VIEWS.EMPLOYEES && (
        <EmployeesPage currentView={currentView} onNavigate={goTo} theme={theme} onToggleTheme={toggleTheme} />
      )}

      {currentView === VIEWS.PAYROLL && (
        <PayrollPage currentView={currentView} onNavigate={goTo} theme={theme} onToggleTheme={toggleTheme} />
      )}

      {currentView === VIEWS.CLIENTS && (
        <ClientsPage currentView={currentView} onNavigate={goTo} theme={theme} onToggleTheme={toggleTheme} />
      )}

      {currentView === VIEWS.BRANCHES && (
        <BranchesPage currentView={currentView} onNavigate={goTo} theme={theme} onToggleTheme={toggleTheme} />
      )}

      {currentView === VIEWS.PROMOTIONS && (
        <PromotionsPage currentView={currentView} onNavigate={goTo} theme={theme} onToggleTheme={toggleTheme} />
      )}

      {currentView === VIEWS.EXPENSES && (
        <ExpensesPage currentView={currentView} onNavigate={goTo} theme={theme} onToggleTheme={toggleTheme} />
      )}
    </>
  );
}

export default App;