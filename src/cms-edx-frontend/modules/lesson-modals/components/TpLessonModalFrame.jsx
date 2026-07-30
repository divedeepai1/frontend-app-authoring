import { useEffect } from "react"
import { X } from "lucide-react"
import "../../../theme/teachers-portal-scope.css"

export default function TpLessonModalFrame({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  headerEnd,
  footer,
  children,
  size = "lg",
  overlayClassName = "",
}) {
  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={`tp-lesson-modal-overlay cms-tp-scope${overlayClassName ? ` ${overlayClassName}` : ""}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`tp-lesson-modal-panel tp-lesson-modal-panel--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tp-lesson-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tp-lesson-modal-header">
          <div className="tp-lesson-modal-header-main">
            {Icon ? (
              <div className="tp-lesson-modal-icon-wrap" aria-hidden>
                <Icon size={20} color="#fff" strokeWidth={2} />
              </div>
            ) : null}
            <div>
              <h2 id="tp-lesson-modal-title" className="tp-lesson-modal-title">
                {title}
              </h2>
              {subtitle ? <p className="tp-lesson-modal-subtitle">{subtitle}</p> : null}
            </div>
          </div>
          <div className="tp-lesson-modal-header-end">
            {headerEnd}
            <button type="button" className="tp-lesson-modal-close" onClick={onClose} aria-label="Close dialog">
              <X size={22} strokeWidth={2} aria-hidden />
            </button>
          </div>
        </header>
        <div className="tp-lesson-modal-body">{children}</div>
        {footer ? <footer className="tp-lesson-modal-footer">{footer}</footer> : null}
      </div>
    </div>
  )
}
