import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

function DashboardLayout({
  children,
  theme,
  onToggleTheme,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="admin-shell">
      <AdminSidebar
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