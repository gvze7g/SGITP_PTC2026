import { AnimatePresence, motion } from "framer-motion";

function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title = "¿Deseas eliminar este registro?",
  description = "Esta acción no se puede deshacer.",
  confirmText = "ELIMINAR",
  cancelText = "CANCELAR",
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
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              width: "min(460px, 92vw)",
              background: "#fff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#2c2521",
                }}
              >
                {title}
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: "15px",
                lineHeight: 1.6,
                color: "#6a5f58",
              }}
            >
              {description}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={onClose}
              >
                {cancelText}
              </button>

              <button
                type="button"
                className="admin-primary-btn"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default ConfirmDeleteModal;