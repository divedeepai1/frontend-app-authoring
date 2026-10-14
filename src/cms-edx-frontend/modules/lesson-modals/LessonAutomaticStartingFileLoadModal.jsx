import { AlertTriangle, FileInput } from "lucide-react"
import TpLessonModalFrame from "./components/TpLessonModalFrame"
import TpModalFeedback from "./components/TpModalFeedback"
import TpStudentSearchField from "./components/TpStudentSearchField"
import TpStudentTableShell from "./components/TpStudentTableShell"
import { useAutomaticStartingFileLoad } from "./hooks/useAutomaticStartingFileLoad"

const COLUMNS = [
  { key: "student", label: "Student", width: "28%" },
  { key: "email", label: "Email", width: "34%" },
  { key: "status", label: "Starting file load", width: "20%" },
  { key: "actions", label: "Actions", alignRight: true, width: "18%" },
]

function SettingSwitch({ checked, disabled, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={[
        "tp-asfl-switch",
        checked ? "tp-asfl-switch--on" : "",
        disabled ? "tp-asfl-switch--busy" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onChange(!checked)}
    >
      <span className="tp-asfl-switch-knob" />
    </button>
  )
}

export default function LessonAutomaticStartingFileLoadModal({
  isOpen,
  onClose,
  title,
  rubricId,
  rubricIds,
  students,
}) {
  const s = useAutomaticStartingFileLoad({ isOpen, rubricId, rubricIds, students })
  const busy = s.loading || s.savingClass || !!s.savingStudentId

  return (
    <TpLessonModalFrame
      isOpen={isOpen}
      onClose={onClose}
      title="Automatic starting file load"
      subtitle={title || "Lesson"}
      icon={FileInput}
      size="xl"
      footer={
        <div className="tp-lesson-modal-footer-inner tp-lesson-modal-footer-inner--end">
          <button
            type="button"
            className="tp-btn tp-btn-secondary"
            onClick={onClose}
            disabled={s.savingClass || !!s.savingStudentId}
          >
            Close
          </button>
        </div>
      }
    >
      <TpModalFeedback error={s.error} success={s.success} />

      <div className="tp-asfl-warning" role="note">
        <AlertTriangle className="tp-asfl-warning-icon" size={18} strokeWidth={2} aria-hidden />
        <div>
          <p className="tp-asfl-warning-title">Turning this off makes cheating easier</p>
          <p className="tp-asfl-warning-text">
            When automatic starting file load is off, students begin from their own document instead
            of the controlled starting file. Use this only when Office build differences break the
            automatic load.
          </p>
        </div>
      </div>

      <section className="tp-lesson-modal-section">
        <h3 className="tp-lesson-modal-section-title">Apply to whole class</h3>
        <div className="tp-asfl-class-row">
          <div className="tp-asfl-class-copy">
            <p className="tp-asfl-class-title">
              {s.classEnabled ? "Automatic load is on" : "Automatic load is off"}
            </p>
            <p className="tp-asfl-class-desc">
              {s.classEnabled
                ? "Students receive the lesson starting file automatically."
                : "Students start from their own document for the selected lesson(s)."}
            </p>
          </div>
          <div className="tp-asfl-class-controls">
            <SettingSwitch
              checked={s.classEnabled}
              disabled={busy}
              onChange={s.setClassEnabled}
              ariaLabel="Toggle automatic starting file load for class"
            />
            <button
              type="button"
              className="tp-btn tp-btn-primary tp-lesson-modal-apply-btn"
              onClick={s.saveClassSetting}
              disabled={busy}
            >
              {s.savingClass ? "Saving…" : "Save for class"}
            </button>
          </div>
        </div>
      </section>

      <TpStudentSearchField
        value={s.search}
        onChange={s.setSearch}
        placeholder="Search student by name or email"
        disabled={s.loading}
      />

      <TpStudentTableShell
        columns={COLUMNS}
        isLoading={s.loading}
        loadingLabel="Loading starting file load settings…"
      >
        {s.filteredRows.length === 0 ? (
          <tr>
            <td colSpan={4} className="tp-lesson-modal-empty">
              No students found.
            </td>
          </tr>
        ) : null}
        {s.filteredRows.map((row) => (
          <tr key={row.id}>
            <td className="tp-lesson-modal-td--wrap">{row.name || "—"}</td>
            <td className="tp-lesson-modal-td--wrap">{row.email || "—"}</td>
            <td>
              <span
                className={`tp-asfl-status ${
                  row.enabled ? "tp-asfl-status--on" : "tp-asfl-status--off"
                }`}
              >
                {row.enabled ? "On" : "Off"}
              </span>
            </td>
            <td className="tp-lesson-modal-td--right">
              <div className="tp-lesson-modal-row-actions">
                <SettingSwitch
                  checked={row.enabled}
                  disabled={busy}
                  onChange={(next) => s.setStudentEnabledLocal(row.id, next)}
                  ariaLabel={`Toggle automatic starting file load for ${row.name || "student"}`}
                />
                <button
                  type="button"
                  className="tp-btn tp-btn-primary tp-btn--compact"
                  disabled={busy}
                  onClick={() => s.saveStudentSetting(row.id, row.enabled)}
                >
                  {s.savingStudentId === row.id ? "Saving…" : "Save"}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </TpStudentTableShell>
    </TpLessonModalFrame>
  )
}
