import { useEffect, useState } from "react"
import { ChevronDown, X } from "lucide-react"

const isValidPositiveFloatInput = (value) =>
  value === "" || /^(\d+\.?\d*|\.\d+)$/.test(value)

export default function GradebookEditModal({
  isOpen,
  onClose,
  courseId,
  student,
  lesson,
  initialValue,
  onSubmit,
  saving,
}) {
  const [actionType, setActionType] = useState("override")
  const [score, setScore] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isOpen) {
      setActionType("override")
      setScore("")
      setReason("")
      setError("")
      return
    }
    setActionType("override")
    setScore(initialValue === null || initialValue === undefined ? "" : String(initialValue))
    setReason("")
    setError("")
  }, [isOpen, initialValue])

  const handleSave = async () => {
    if (actionType === "override") {
      const trimmedScore = score.trim()
      if (trimmedScore === "") {
        setError("Please enter a grade value to override.")
        return
      }
      if (!isValidPositiveFloatInput(trimmedScore)) {
        setError("Grade must be a positive number greater than 0.")
        return
      }
      const parsed = parseFloat(trimmedScore)
      if (Number.isNaN(parsed) || parsed <= 0) {
        setError("Grade must be a positive number greater than 0.")
        return
      }
    }
    setError("")
    const trimmedScore = score.trim()
    const parsedScore =
      actionType === "override" && trimmedScore !== "" ? parseFloat(trimmedScore) : null
    await onSubmit({
      courseId,
      rubricId: lesson?.id,
      userId: student?.id,
      overrideScore:
        actionType === "reset" ? null : Number.isFinite(parsedScore) ? parsedScore : null,
      reason: reason.trim(),
    })
  }

  if (!isOpen) return null

  const subtitle = `${student?.email || student?.name || "Student"} • ${lesson?.title || "Lesson"}`

  return (
    <div
      className="tp-lesson-modal-overlay tp-lesson-modal-overlay--nested cms-tp-scope"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="tp-gradebook-edit-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tp-gradebook-edit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tp-gradebook-edit-header">
          <div>
            <h2 id="tp-gradebook-edit-title" className="tp-gradebook-edit-title">
              Edit lesson grade
            </h2>
            <p className="tp-gradebook-edit-subtitle">{subtitle}</p>
          </div>
          <button type="button" className="tp-lesson-modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={22} strokeWidth={2} aria-hidden />
          </button>
        </header>

        <div className="tp-gradebook-edit-body">
          {error ? <div className="tp-lesson-modal-alert tp-lesson-modal-alert--error">{error}</div> : null}

          <div className="tp-gradebook-edit-field">
            <label className="tp-gradebook-edit-label" htmlFor="tp-gradebook-action">
              Action
            </label>
            <div className="tp-gradebook-select-wrap">
              <select
                id="tp-gradebook-action"
                className="tp-gradebook-edit-select"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                disabled={saving}
              >
                <option value="override">Override grade</option>
                <option value="reset">Reset grade</option>
              </select>
              <ChevronDown className="tp-gradebook-select-chevron" size={16} strokeWidth={2} aria-hidden />
            </div>
          </div>

          {actionType === "override" ? (
            <div className="tp-gradebook-edit-field">
              <label className="tp-gradebook-edit-label" htmlFor="tp-gradebook-score">
                Grade value
              </label>
              <input
                id="tp-gradebook-score"
                type="text"
                className="tp-gradebook-edit-input"
                value={score}
                onChange={(e) => {
                  const nextValue = e.target.value
                  if (isValidPositiveFloatInput(nextValue)) {
                    setScore(nextValue)
                    if (error) setError("")
                  }
                }}
                placeholder="e.g. 85 or 8.5"
                disabled={saving}
              />
            </div>
          ) : null}

          <div className="tp-gradebook-edit-field">
            <label className="tp-gradebook-edit-label" htmlFor="tp-gradebook-reason">
              Reason <span className="tp-gradebook-edit-label-optional">(optional)</span>
            </label>
            <textarea
              id="tp-gradebook-reason"
              className="tp-gradebook-edit-textarea"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add a note for this grade change"
              disabled={saving}
            />
          </div>
        </div>

        <footer className="tp-gradebook-edit-footer">
          <button type="button" className="tp-btn tp-btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="tp-btn tp-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save change"}
          </button>
        </footer>
      </div>
    </div>
  )
}
