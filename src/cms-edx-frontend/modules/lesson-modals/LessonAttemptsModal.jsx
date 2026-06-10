import { ListChecks } from "lucide-react"
import TpLessonModalFrame from "./components/TpLessonModalFrame"
import TpModalFeedback from "./components/TpModalFeedback"
import TpStudentSearchField from "./components/TpStudentSearchField"
import TpStudentTableShell from "./components/TpStudentTableShell"
import { useLessonAttempts } from "./hooks/useLessonAttempts"
import { MAX_ATTEMPTS } from "./utils/attempts"

const COLUMNS = [
  { key: "student", label: "Student", width: "16%" },
  { key: "email", label: "Email", width: "22%" },
  { key: "allotted", label: "Attempts allotted", width: "16%" },
  { key: "used", label: "Number of attempts", width: "16%" },
  { key: "actions", label: "Actions", alignRight: true, width: "30%" },
]

export default function LessonAttemptsModal({ isOpen, onClose, title, rubricId, rubricIds, students }) {
  const a = useLessonAttempts({ isOpen, rubricId, rubricIds, students })

  return (
    <TpLessonModalFrame
      isOpen={isOpen}
      onClose={onClose}
      title="Lesson attempts setup"
      subtitle={title || "Lesson"}
      icon={ListChecks}
      size="xl"
    >
      <TpModalFeedback error={a.error} success={a.success} />

      <section className="tp-lesson-modal-section">
        <div className="tp-lesson-modal-inline-fields">
          <div className="tp-lesson-modal-field tp-lesson-modal-field--grow">
            <label className="tp-label">Max attempts for this lesson</label>
            <select
              className="tp-input"
              value={a.loading ? "" : a.maxAttempts}
              onChange={(e) => {
                const value = e.target.value
                a.setMaxAttempts(value === "unlimited" ? "unlimited" : Number(value))
              }}
              disabled={a.loading || a.savingClass || !!a.savingStudentId}
            >
              {a.loading ? (
                <option value="">Loading default attempts…</option>
              ) : (
                <>
                  {a.attemptOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                  <option value="unlimited">Unlimited Attempts</option>
                </>
              )}
            </select>
          </div>
          <button
            type="button"
            className="tp-btn tp-btn-primary tp-lesson-modal-apply-btn"
            onClick={a.saveClassAttempts}
            disabled={a.loading || a.savingClass || !!a.savingStudentId}
          >
            {a.savingClass ? "Saving…" : "Save for class"}
          </button>
        </div>
      </section>

      <TpStudentSearchField
        value={a.search}
        onChange={a.setSearch}
        placeholder="Search student by name or email"
        disabled={a.loading || a.savingClass || !!a.savingStudentId}
      />

      <TpStudentTableShell columns={COLUMNS}>
        {a.loading ? (
          <tr>
            <td colSpan={5} className="tp-lesson-modal-empty">
              Loading attempts…
            </td>
          </tr>
        ) : null}
        {!a.loading && a.filteredRows.length === 0 ? (
          <tr>
            <td colSpan={5} className="tp-lesson-modal-empty">
              No students found.
            </td>
          </tr>
        ) : null}
        {!a.loading &&
          a.filteredRows.map((row) => (
            <tr key={row.id}>
              <td className="tp-lesson-modal-td--wrap">{row.name || "—"}</td>
              <td className="tp-lesson-modal-td--wrap">{row.email || "—"}</td>
              <td>{row.attemptsAllotted === null ? "Unlimited Attempts" : row.attemptsAllotted}</td>
              <td>{row.numberOfAttempts === null ? "Unlimited Attempts" : row.numberOfAttempts}</td>
              <td className="tp-lesson-modal-td--right">
                <div className="tp-lesson-modal-row-actions">
                  <button
                    type="button"
                    className="tp-btn tp-btn-secondary tp-btn--compact"
                    disabled={
                      a.savingClass ||
                      a.savingStudentId === row.id ||
                      row.numberOfAttempts === null ||
                      row.numberOfAttempts >= MAX_ATTEMPTS
                    }
                    onClick={() =>
                      a.saveStudentAttempts(row.id, (row.numberOfAttempts || 0) + 1, (row.numberOfAttempts || 0) + 1)
                    }
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="tp-btn tp-btn-primary tp-btn--compact"
                    disabled={a.savingClass || a.savingStudentId === row.id}
                    onClick={() =>
                      a.saveStudentAttempts(
                        row.id,
                        a.maxAttempts === "unlimited" ? null : a.maxAttempts,
                        a.maxAttempts === "unlimited" ? null : a.maxAttempts
                      )
                    }
                  >
                    Reset attempts
                  </button>
                  <button
                    type="button"
                    className="tp-btn tp-btn-secondary tp-btn--compact"
                    disabled={a.savingClass || a.savingStudentId === row.id || row.numberOfAttempts === null}
                    onClick={() => a.saveStudentAttempts(row.id, null, null)}
                  >
                    Unlimited
                  </button>
                </div>
              </td>
            </tr>
          ))}
      </TpStudentTableShell>
    </TpLessonModalFrame>
  )
}
