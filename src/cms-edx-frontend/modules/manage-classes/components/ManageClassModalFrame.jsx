import { useEffect } from "react"
import { Users, X } from "lucide-react"

export default function ManageClassModalFrame({
  title,
  subtitle,
  onClose,
  headerEnd,
  progress,
  showProgress,
  children,
  footer,
  wide = false,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="tp-mc-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className={`tp-mc-modal-panel${wide ? " tp-mc-modal-panel--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tp-mc-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tp-mc-modal-header">
          <div className="tp-mc-modal-header-main">
            <div className="tp-mc-modal-icon-wrap" aria-hidden>
              <Users size={20} color="#fff" strokeWidth={2} />
            </div>
            <div className="tp-mc-modal-header-text">
              <h2 id="tp-mc-modal-title" className="tp-mc-modal-title">
                {title}
              </h2>
              {subtitle ? <p className="tp-mc-modal-subtitle">{subtitle}</p> : null}
            </div>
          </div>
          <div className="tp-mc-modal-header-end">
            {headerEnd}
            <button type="button" className="tp-mc-modal-close" onClick={onClose} aria-label="Close dialog">
              <X size={20} strokeWidth={2} aria-hidden />
            </button>
          </div>
        </header>
        {showProgress && progress ? <div className="tp-mc-modal-progress">{progress}</div> : null}
        <div className="tp-mc-modal-body">{children}</div>
        {footer ? <footer className="tp-mc-modal-footer">{footer}</footer> : null}
      </div>
    </div>
  )
}
