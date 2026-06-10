import { Calendar } from "lucide-react"
import TpLessonModalFrame from "./components/TpLessonModalFrame"
import TpModalFeedback from "./components/TpModalFeedback"
import TpStudentSearchField from "./components/TpStudentSearchField"
import TpStudentTableShell from "./components/TpStudentTableShell"
import { useLessonSchedule } from "./hooks/useLessonSchedule"

const COLUMNS = [
  { key: "email", label: "Email", width: "45%" },
  { key: "due", label: "Due date", width: "30%" },
  { key: "actions", label: "Actions", alignRight: true, width: "25%" },
]

function BulkScheduleModal({
  isOpen,
  onClose,
  bulkStart,
  setBulkStart,
  bulkDue,
  setBulkDue,
  bulkError,
  savingAll,
  onSave,
}) {
  if (!isOpen) return null
  return (
    <div className="tp-lesson-modal-overlay tp-lesson-modal-overlay--nested" role="presentation" onClick={onClose}>
      <div
        className="tp-lesson-modal-panel tp-lesson-modal-panel--sm cms-tp-scope"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tp-lesson-modal-header">
          <h2 className="tp-lesson-modal-title">Set schedule for all students</h2>
        </header>
        <div className="tp-lesson-modal-body">
          <TpModalFeedback error={bulkError} />
          <div className="tp-lesson-modal-field">
            <label className="tp-label" htmlFor="tp-bulk-start">
              Start date
            </label>
            <input
              id="tp-bulk-start"
              type="date"
              className="tp-input"
              value={bulkStart}
              onChange={(e) => setBulkStart(e.target.value)}
            />
          </div>
          <div className="tp-lesson-modal-field">
            <label className="tp-label" htmlFor="tp-bulk-due">
              Due date (optional)
            </label>
            <input
              id="tp-bulk-due"
              type="date"
              className="tp-input"
              value={bulkDue}
              onChange={(e) => setBulkDue(e.target.value)}
            />
          </div>
        </div>
        <footer className="tp-lesson-modal-footer">
          <div className="tp-lesson-modal-footer-inner">
            <button type="button" className="tp-btn tp-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="tp-btn tp-btn-primary"
              onClick={onSave}
              disabled={savingAll || (!bulkStart && !bulkDue)}
            >
              {savingAll ? "Saving…" : "Save for all"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default function LessonScheduleModal({ isOpen, onClose, title, students, rubricId, rubricIds }) {
  const s = useLessonSchedule({ isOpen, rubricId, rubricIds, students })

  return (
    <>
      <TpLessonModalFrame
        isOpen={isOpen}
        onClose={onClose}
        title="Schedule lesson access"
        subtitle={title || "Lesson"}
        icon={Calendar}
        size="lg"
        headerEnd={
          <button type="button" className="tp-btn tp-btn-secondary" onClick={s.openBulkModal}>
            Set access for all
          </button>
        }
      >
        <TpModalFeedback error={s.error} />
        <TpStudentSearchField
          value={s.search}
          onChange={s.setSearch}
          placeholder="Search by email"
          disabled={s.loading}
        />
        {s.loading ? <p className="tp-lesson-modal-loading">Loading schedules…</p> : null}
        <TpStudentTableShell columns={COLUMNS}>
          {!s.loading && s.filteredRows.length === 0 ? (
            <tr>
              <td colSpan={3} className="tp-lesson-modal-empty">
                No students found.
              </td>
            </tr>
          ) : null}
          {!s.loading &&
            s.filteredRows.map((row) => (
              <tr key={row.id}>
                <td className="tp-lesson-modal-td--wrap">{row.email}</td>
                <td>
                  <input
                    type="date"
                    className="tp-input tp-input--compact"
                    value={row.due}
                    onChange={(e) => s.handleRowChange(row.id, "due", e.target.value)}
                  />
                </td>
                <td className="tp-lesson-modal-td--right">
                  <button
                    type="button"
                    className="tp-btn tp-btn-primary tp-btn--compact"
                    disabled={!!s.savingId && s.savingId !== row.id}
                    onClick={() => s.handleSaveRow(row)}
                  >
                    {s.savingId === row.id ? "Saving…" : "Save"}
                  </button>
                </td>
              </tr>
            ))}
        </TpStudentTableShell>
      </TpLessonModalFrame>

      <BulkScheduleModal
        isOpen={s.bulkOpen}
        onClose={() => s.setBulkOpen(false)}
        bulkStart={s.bulkStart}
        setBulkStart={s.setBulkStart}
        bulkDue={s.bulkDue}
        setBulkDue={s.setBulkDue}
        bulkError={s.bulkError}
        savingAll={s.savingAll}
        onSave={s.handleBulkSave}
      />
    </>
  )
}
