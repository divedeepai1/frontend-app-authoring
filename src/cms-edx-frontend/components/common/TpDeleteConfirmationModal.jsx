import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import { tpToast } from "./tpToast"
import "../../theme/teachers-portal-scope.css"

export default function TpDeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}) {
  const [pending, setPending] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setPending(true)
    try {
      await Promise.resolve(onConfirm())
      onClose()
    } catch (err) {
      tpToast.error(err?.message || "Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      className="tp-modal-overlay tp-modal-overlay--stack"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose()
      }}
    >
      <div
        className="tp-modal-panel cms-tp-scope"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tp-del-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tp-modal-header">
          <h2 id="tp-del-title" className="tp-modal-title">
            {title}
          </h2>
          <button type="button" className="tp-modal-close" onClick={onClose} disabled={pending} aria-label="Close">
            <X size={22} strokeWidth={2} />
          </button>
        </div>
        <div className="tp-modal-body">
          <div className="tp-modal-warn-row">
            <div className="tp-modal-warn-icon" aria-hidden>
              <AlertTriangle size={22} color="#dc2626" strokeWidth={2} />
            </div>
            <div>
              <p className="tp-modal-text">{message}</p>
              {itemName ? <p className="tp-modal-item-name">&quot;{itemName}&quot;</p> : null}
            </div>
          </div>
        </div>
        <div className="tp-modal-footer">
          <button type="button" className="tp-btn tp-btn-secondary" onClick={onClose} disabled={pending}>
            {cancelLabel}
          </button>
          <button type="button" className="tp-btn tp-btn-danger" onClick={handleConfirm} disabled={pending}>
            {pending ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
