import { ArrowLeftRight } from "lucide-react"
import TpCheckbox from "../../../components/common/TpCheckbox"
import TpLessonModalFrame from "../../lesson-modals/components/TpLessonModalFrame"
import { getStudentDisplayName } from "../utils/eligibleTargetClasses"

export default function MoveStudentModal({
  isOpen,
  onClose,
  student,
  sourceClassName,
  targetClassId,
  onTargetClassChange,
  eligibleTargets = [],
  loadingTargets = false,
  includeGrades,
  canCarryOver,
  carryOverHelperText,
  onIncludeGradesChange,
  onConfirm,
  submitting = false,
  error = "",
}) {
  const studentName = getStudentDisplayName(student)
  const className = sourceClassName?.trim() || "this class"
  const hasTargets = eligibleTargets.length > 0
  const canSubmit =
    Boolean(String(student?.email || "").trim()) &&
    Boolean(targetClassId) &&
    !submitting &&
    !loadingTargets &&
    hasTargets

  const footer = (
    <div className="tp-lesson-modal-footer-inner tp-lesson-modal-footer-inner--end">
      <button
        type="button"
        className="tp-btn tp-btn-secondary"
        onClick={onClose}
        disabled={submitting}
      >
        Cancel
      </button>
      <button
        type="button"
        className="tp-btn tp-btn-primary"
        onClick={onConfirm}
        disabled={!canSubmit}
        aria-busy={submitting}
      >
        {submitting ? "Moving…" : "Confirm Move"}
      </button>
    </div>
  )

  return (
    <TpLessonModalFrame
      isOpen={isOpen}
      onClose={submitting ? undefined : onClose}
      title="Move Student"
      icon={ArrowLeftRight}
      size="md"
      overlayClassName="tp-lesson-modal-overlay--stack"
      footer={footer}
    >
      <div className="tp-move-student">
        <div className="tp-move-student-summary" role="status">
          Move <strong>{studentName}</strong> from <strong>{className}</strong> to another class.
        </div>

        {error ? (
          <div className="tp-lesson-modal-alert tp-lesson-modal-alert--error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="tp-move-student-field">
          <label className="tp-label" htmlFor="tp-move-target-class">
            Target Class
          </label>
          {loadingTargets ? (
            <p className="tp-move-student-loading" aria-live="polite">
              Loading classes…
            </p>
          ) : (
            <select
              id="tp-move-target-class"
              className="tp-input tp-move-student-select"
              value={targetClassId}
              onChange={(e) => onTargetClassChange(e.target.value)}
              disabled={submitting || !hasTargets}
              aria-describedby={!hasTargets ? "tp-move-no-targets" : undefined}
            >
              <option value="">Select target class</option>
              {eligibleTargets.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name || `Class ${cls.id}`}
                </option>
              ))}
            </select>
          )}
          {!loadingTargets && !hasTargets ? (
            <p id="tp-move-no-targets" className="tp-field-error" role="status">
              No eligible target classes available. Active classes other than the source class are required.
            </p>
          ) : null}
        </div>

        <div className={`tp-move-student-carry${canCarryOver ? "" : " tp-move-student-carry--disabled"}`}>
          <TpCheckbox
            id="tp-move-carry-over"
            name="carry-over-student-data"
            checked={Boolean(includeGrades) && canCarryOver}
            disabled={!canCarryOver || submitting}
            onChange={(e) => onIncludeGradesChange(e.target.checked)}
            ariaLabel="Carry over student data"
          />
          <div className="tp-move-student-carry-copy">
            <label className="tp-move-student-carry-label" htmlFor="tp-move-carry-over">
              Carry over student data
            </label>
            <p className="tp-move-student-carry-help" id="tp-move-carry-help">
              {carryOverHelperText}
            </p>
          </div>
        </div>
      </div>
    </TpLessonModalFrame>
  )
}
