import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

function AppModalShell({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="app-modal-overlay app-modal-overlay-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`app-modal-shell app-modal-${size}`}
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="app-modal-shell-header">
              <h2>{title}</h2>

              <button
                type="button"
                className="app-modal-close-btn"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="app-modal-shell-body">{children}</div>

            {footer ? <div className="app-modal-shell-footer">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default AppModalShell;