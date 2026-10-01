import { Scale, X } from "lucide-react"
import messages from "../../../../course-outline/course-weight-settings-modal/messages"
import { useCourseWeightSettings } from "../../../../course-outline/course-weight-settings-modal/useCourseWeightSettings"

export default function ClassWeightSettingsModal({
  isOpen,
  courseId,
  onClose,
  onFetch,
  onSave,
  onSaveSuccess,
  modalTitle,
  modalDescription,
}) {
  const w = useCourseWeightSettings({
    isOpen,
    courseId,
    onFetch,
    onSave,
    onSaveSuccess,
    onClose,
  })

  if (!isOpen) return null

  return (
    <div
      className="tp-lesson-modal-overlay cms-tp-scope"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="tp-weight-settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tp-weight-settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tp-weight-settings-header">
          <div className="tp-weight-settings-header-main">
            <div className="tp-weight-settings-icon-wrap" aria-hidden>
              <Scale size={20} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <h2 id="tp-weight-settings-title" className="tp-weight-settings-title">
                {modalTitle || messages.title.defaultMessage}
              </h2>
              <p className="tp-weight-settings-subtitle">
                {modalDescription || messages.description.defaultMessage}
              </p>
            </div>
          </div>
          <button type="button" className="tp-lesson-modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={22} strokeWidth={2} aria-hidden />
          </button>
        </header>

        <div className="tp-weight-settings-body">
          {w.error ? <div className="tp-lesson-modal-alert tp-lesson-modal-alert--error">{w.error}</div> : null}

          {w.isLoading ? (
            <p className="tp-weight-settings-loading">Loading weight settings...</p>
          ) : (
            <>
              <div className="tp-weight-settings-field">
                <label className="tp-weight-settings-label" htmlFor="tp-class-lesson-weight">
                  {messages.lessonWeightLabel.defaultMessage}
                </label>
                <input
                  id="tp-class-lesson-weight"
                  type="text"
                  inputMode="decimal"
                  className={`tp-weight-settings-input${w.showLessonError ? " tp-weight-settings-input--error" : ""}`}
                  value={w.lessonWeight}
                  onChange={w.handleLessonChange}
                  onKeyDown={(event) => {
                    if (["-", "e", "E", "+"].includes(event.key)) event.preventDefault()
                  }}
                  disabled={w.isSaving}
                />
                {w.showLessonError ? (
                  <p className="tp-weight-settings-error">{messages.validationMessage.defaultMessage}</p>
                ) : null}
              </div>

              <div className="tp-weight-settings-field">
                <label className="tp-weight-settings-label" htmlFor="tp-class-quiz-weight">
                  {messages.quizWeightLabel.defaultMessage}
                </label>
                <input
                  id="tp-class-quiz-weight"
                  type="text"
                  inputMode="decimal"
                  className={`tp-weight-settings-input${w.showQuizError ? " tp-weight-settings-input--error" : ""}`}
                  value={w.quizWeight}
                  onChange={w.handleQuizChange}
                  onKeyDown={(event) => {
                    if (["-", "e", "E", "+"].includes(event.key)) event.preventDefault()
                  }}
                  disabled={w.isSaving}
                />
                {w.showQuizError ? (
                  <p className="tp-weight-settings-error">{messages.validationMessage.defaultMessage}</p>
                ) : null}
              </div>

              <div className="tp-weight-settings-field">
                <label className="tp-weight-settings-label" htmlFor="tp-class-test-weight">
                  {messages.testWeightLabel.defaultMessage}
                </label>
                <input
                  id="tp-class-test-weight"
                  type="text"
                  inputMode="decimal"
                  className={`tp-weight-settings-input${w.showTestError ? " tp-weight-settings-input--error" : ""}`}
                  value={w.testWeight}
                  onChange={w.handleTestChange}
                  onKeyDown={(event) => {
                    if (["-", "e", "E", "+"].includes(event.key)) event.preventDefault()
                  }}
                  disabled={w.isSaving}
                />
                {w.showTestError ? (
                  <p className="tp-weight-settings-error">{messages.validationMessage.defaultMessage}</p>
                ) : null}
              </div>

              <p className={`tp-weight-settings-hint${w.showTotalError ? " tp-weight-settings-error" : ""}`}>
                {messages.totalValidationMessage.defaultMessage}
                {w.weightTotal !== null ? ` (current total: ${w.weightTotal})` : ""}
              </p>
            </>
          )}
        </div>

        <footer className="tp-weight-settings-footer">
          <button type="button" className="tp-btn tp-btn-outline" onClick={onClose} disabled={w.isSaving}>
            {messages.cancelButton.defaultMessage}
          </button>
          <button
            type="button"
            className="tp-btn tp-btn-primary"
            onClick={w.handleSave}
            disabled={!w.canSave || !w.isDirty || w.isLoading || w.isSaving}
          >
            {w.isSaving ? "Saving..." : messages.saveButton.defaultMessage}
          </button>
        </footer>
      </div>
    </div>
  )
}
