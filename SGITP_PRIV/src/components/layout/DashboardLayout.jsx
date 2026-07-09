import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

function DashboardLayout({
  children,
  theme,
  onToggleTheme,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder,
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
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          searchPlaceholder={searchPlaceholder}
        />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
