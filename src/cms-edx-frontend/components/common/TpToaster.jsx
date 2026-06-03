import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react"

const VARIANTS = {
  success: {
    className: "tp-toast--success",
    Icon: CheckCircle2,
  },
  error: {
    className: "tp-toast--error",
    Icon: AlertTriangle,
  },
  info: {
    className: "tp-toast--info",
    Icon: Info,
  },
}

export default function TpToaster({ toasts = [], onDismiss }) {
  if (!toasts.length) return null

  return (
    <div
      className="tp-toast-viewport cms-tp-scope"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const variant = VARIANTS[toast.variant] || VARIANTS.info
        const Icon = variant.Icon
        return (
          <div key={toast.id} className={`tp-toast ${variant.className}`} role="status">
            <div className="tp-toast-icon-wrap" aria-hidden>
              <Icon className="tp-toast-icon" size={20} strokeWidth={2} />
            </div>
            <div className="tp-toast-content">
              {toast.title ? <p className="tp-toast-title">{toast.title}</p> : null}
              {toast.description ? <p className="tp-toast-description">{toast.description}</p> : null}
            </div>
            <button
              type="button"
              className="tp-toast-close"
              onClick={() => onDismiss?.(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
