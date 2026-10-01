import { X } from "lucide-react"

export default function StudentReportModal({ isOpen, title, imageUrl, onClose }) {
  if (!isOpen) return null

  return (
    <div
      className="tp-lesson-modal-overlay tp-lesson-modal-overlay--nested cms-tp-scope"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="tp-student-report-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tp-student-report-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tp-student-report-header">
          <h2 id="tp-student-report-title" className="tp-student-report-title">
            Student Attempt — {title}
          </h2>
          <button type="button" className="tp-lesson-modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={22} strokeWidth={2} aria-hidden />
          </button>
        </header>
        <div className="tp-student-report-body">
          <img src={imageUrl} alt={`Student attempt: ${title}`} className="tp-student-report-image" />
        </div>
      </div>
    </div>
  )
}
