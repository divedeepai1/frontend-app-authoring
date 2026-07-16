import { Clock } from "lucide-react"
import TpLessonModalFrame from "./components/TpLessonModalFrame"
import TpModalFeedback from "./components/TpModalFeedback"
import TpStudentSearchField from "./components/TpStudentSearchField"
import TpStudentTableShell from "./components/TpStudentTableShell"
import { useLessonTimer } from "./hooks/useLessonTimer"
import { TIMER_MODE_OPTIONS } from "./utils/timer"

const COLUMNS = [
  { key: "student", label: "Student", width: "16%" },
  { key: "email", label: "Email", width: "22%" },
  { key: "mode", label: "Timer mode", width: "24%" },
  { key: "hours", label: "Hours", width: "10%" },
  { key: "minutes", label: "Minutes", width: "10%" },
  { key: "actions", label: "Actions", alignRight: true, width: "18%" },
]

export default function LessonTimerModal({ isOpen, onClose, title, rubricId, rubricIds, students }) {
  const t = useLessonTimer({ isOpen, rubricId, rubricIds, students })

  return (
    <TpLessonModalFrame
      isOpen={isOpen}
      onClose={onClose}
      title="Lesson timer setup"
      subtitle={title || "Lesson"}
      icon={Clock}
      size="xl"
      headerEnd={
        <button
          type="button"
          className="tp-btn tp-btn-secondary"
          onClick={t.handleRemoveAllTimer}
          disabled={!!t.savingId || t.loading || t.savingAll}
        >
          {t.savingAll ? "Removing…" : "Remove all timers"}
        </button>
      }
      footer={
        <div className="tp-lesson-modal-footer-inner tp-lesson-modal-footer-inner--end">
          <button type="button" className="tp-btn tp-btn-secondary" onClick={onClose} disabled={!!t.savingId || t.savingAll}>
            Close
          </button>
        </div>
      }
    >
      <TpModalFeedback error={t.error} success={t.success} />

      <section className="tp-lesson-modal-section">
        <h3 className="tp-lesson-modal-section-title">Setup timer for all students</h3>
        <div className="tp-lesson-modal-inline-fields">
          <div className="tp-lesson-modal-field tp-lesson-modal-field--grow">
            <label className="tp-label">Timer mode</label>
            <select
              className="tp-input"
              value={t.globalTimerMode}
              onChange={(e) => t.setGlobalTimerMode(e.target.value)}
              disabled={t.loading || !!t.savingId || t.savingAll}
            >
              {TIMER_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="tp-lesson-modal-field">
            <label className="tp-label">Hours</label>
            <select
              className="tp-input"
              value={t.globalHours}
              onChange={(e) => t.setGlobalHours(e.target.value)}
              disabled={t.loading || !!t.savingId || t.savingAll}
            >
              {t.hourOptions.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </div>
          <div className="tp-lesson-modal-field">
            <label className="tp-label">Minutes</label>
            <select
              className="tp-input"
              value={t.globalMinutes}
              onChange={(e) => t.setGlobalMinutes(e.target.value)}
              disabled={t.loading || !!t.savingId || t.savingAll}
            >
              {t.minuteOptions.map((minute) => (
                <option key={minute} value={minute}>
                  {minute}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="tp-btn tp-btn-primary tp-lesson-modal-apply-btn"
            onClick={t.handleApplyAllTimer}
            disabled={t.loading || !!t.savingId || t.savingAll}
          >
            {t.savingAll ? "Applying…" : "Apply to all"}
          </button>
        </div>
      </section>

      <TpStudentSearchField
        value={t.search}
        onChange={t.setSearch}
        placeholder="Search by student name or email"
        disabled={t.loading}
      />

      <TpStudentTableShell
        columns={COLUMNS}
        isLoading={t.loading}
        loadingLabel="Loading timer settings…"
      >
        {t.filteredRows.length === 0 ? (
          <tr>
            <td colSpan={6} className="tp-lesson-modal-empty">
              No students found.
            </td>
          </tr>
        ) : null}
        {t.filteredRows.map((row) => (
            <tr key={row.id}>
              <td className="tp-lesson-modal-td--wrap">{row.name}</td>
              <td className="tp-lesson-modal-td--wrap">{row.email || "—"}</td>
              <td>
                <select
                  className="tp-input tp-input--compact"
                  value={row.timerMode}
                  onChange={(e) => t.handleRowChange(row.id, "timerMode", e.target.value)}
                  disabled={!!t.savingId || t.savingAll}
                >
                  {TIMER_MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  className="tp-input tp-input--compact"
                  value={row.hours}
                  onChange={(e) => t.handleRowChange(row.id, "hours", e.target.value)}
                  disabled={!!t.savingId || t.savingAll}
                >
                  {t.hourOptions.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  className="tp-input tp-input--compact"
                  value={row.minutes}
                  onChange={(e) => t.handleRowChange(row.id, "minutes", e.target.value)}
                  disabled={!!t.savingId || t.savingAll}
                >
                  {t.minuteOptions.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </td>
              <td className="tp-lesson-modal-td--right">
                <div className="tp-lesson-modal-row-actions">
                  <button
                    type="button"
                    className="tp-btn tp-btn-secondary tp-btn--compact"
                    onClick={() => t.handleRemoveRowTimer(row.id)}
                    disabled={t.savingAll || (!!t.savingId && t.savingId !== row.id)}
                  >
                    {t.savingId === row.id ? "Removing…" : "Remove"}
                  </button>
                  <button
                    type="button"
                    className="tp-btn tp-btn-primary tp-btn--compact"
                    onClick={() => t.handleSaveRow(row)}
                    disabled={(!!t.savingId && t.savingId !== row.id) || t.savingAll}
                  >
                    {t.savingId === row.id ? "Saving…" : "Save"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
      </TpStudentTableShell>
    </TpLessonModalFrame>
  )
}
