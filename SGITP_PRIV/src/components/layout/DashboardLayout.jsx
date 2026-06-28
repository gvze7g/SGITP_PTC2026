import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

function DashboardLayout({
  children,
  currentView,
  onNavigate,
  theme,
  onToggleTheme,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="admin-shell">
      <AdminSidebar
        currentView={currentView}
        onNavigate={onNavigate}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      <div className="admin-main">
        <AdminTopbar
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;