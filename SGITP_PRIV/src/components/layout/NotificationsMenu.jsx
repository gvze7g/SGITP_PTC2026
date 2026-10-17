import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../hooks/notifications/UseNotifications';

// Campana de la barra superior con los avisos reales del negocio.
function NotificationsMenu() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, seenIds, loading, refresh, markAllAsSeen } = useNotifications();

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleOpenItem = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="admin-notifications" ref={wrapperRef}>
      <button
        type="button"
        className="admin-icon-btn admin-notifications-trigger"
        aria-label={unreadCount ? `Notificaciones: ${unreadCount} sin leer` : 'Notificaciones'}
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
          if (!open) refresh();
        }}
      >
        <Bell size={22} strokeWidth={1.8} />
        {unreadCount ? (
          <span className="admin-notifications-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="admin-notifications-panel"
            role="dialog"
            aria-label="Notificaciones"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="admin-notifications-header">
              <strong>Notificaciones</strong>
              <div>
                <button type="button" onClick={refresh} aria-label="Actualizar" disabled={loading}>
                  <RefreshCw size={16} strokeWidth={1.8} />
                </button>
                <button type="button" onClick={markAllAsSeen} disabled={!unreadCount}>
                  Marcar como leídas
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <p className="admin-notifications-empty">
                {loading ? 'Revisando...' : 'Todo está al día. No hay avisos pendientes.'}
              </p>
            ) : (
              <ul className="admin-notifications-list">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      className={`admin-notification admin-notification-${notification.tone} ${
                        seenIds.has(notification.id) ? '' : 'admin-notification-unread'
                      }`}
                      onClick={() => handleOpenItem(notification.path)}
                    >
                      <strong>{notification.title}</strong>
                      <span>{notification.description}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default NotificationsMenu;
