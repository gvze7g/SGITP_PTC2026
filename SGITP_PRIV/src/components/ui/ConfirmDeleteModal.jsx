import { Trash2 } from 'lucide-react';

function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title = '¿Está seguro de eliminar este registro?',
  description = 'Esta acción no se puede deshacer. Por favor, confirme si desea proceder con la eliminación.',
  confirmText = 'ELIMINAR',
  cancelText = 'CANCELAR',
}) {
  if (!open) return null;

  return (
    <div className="app-modal-overlay">
      <div className="confirm-delete-modal">
        <div className="confirm-delete-icon">
          <Trash2 size={34} strokeWidth={2} />
        </div>

        <h3 className="confirm-delete-title">{title}</h3>

        <p className="confirm-delete-text">{description}</p>

        <div className="confirm-delete-actions">
          <button
            type="button"
            className="confirm-cancel-btn"
            onClick={onClose}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="confirm-delete-btn"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;