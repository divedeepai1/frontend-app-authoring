import { useMemo } from "react"
import { Pencil } from "lucide-react"
import TpLoadingState from "../../../components/common/TpLoadingState"

function renderCellValue(cell) {
  if (!cell || typeof cell !== "object") return { text: "Not graded", isMuted: true }
  if (cell.score === null || cell.score === undefined) return { text: "Not graded", isMuted: true }
  return { text: String(cell.score), isMuted: false }
}

function renderOverallGradeValue(overallGrade) {
  if (overallGrade === null || overallGrade === undefined || Number.isNaN(Number(overallGrade))) {
    return { text: "Not graded", isMuted: true }
  }
  return { text: String(overallGrade), isMuted: false }
}

export default function GradebookDataTable({
  lessons,
  students,
  gradesByStudent,
  editedLessonIds,
  onEditCell,
  isLoading = false,
  loadingLabel = "Loading gradebook…",
}) {
  const colWidths = useMemo(() => {
    const lessonCols = lessons.map(() => "10rem")
    return ["14rem", ...lessonCols, "9rem"]
  }, [lessons])

  if (isLoading) {
    return <TpLoadingState label={loadingLabel} className="tp-gradebook-loading" />
  }

  if (!students.length) {
    return <p className="tp-gradebook-empty">No students found for this class.</p>
  }

  if (!lessons.length) {
    return <p className="tp-gradebook-empty">No lessons found for this course.</p>
  }

  return (
    <div className="tp-gradebook-table-wrap">
      <table className="tp-gradebook-table">
        <colgroup>
          {colWidths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="tp-gradebook-th tp-gradebook-th--student">
              <span className="tp-gradebook-th-label">Student</span>
            </th>
            {lessons.map((lesson) => (
              <th
                key={lesson.id}
                className={`tp-gradebook-th${
                  lesson.isAssessmentStyle ? " tp-gradebook-th--assessment" : ""
                }`}
                title={lesson.contentType || undefined}
              >
                <span className="tp-gradebook-th-label" title={String(lesson.id)}>
                  {lesson.title}
                </span>
                {editedLessonIds.has(String(lesson.id)) ? (
                  <span className="tp-gradebook-th-edited">Edited</span>
                ) : null}
              </th>
            ))}
            <th className="tp-gradebook-th">
              <span className="tp-gradebook-th-label">Overall Grade</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const rowGrades = gradesByStudent[String(student.id)] || {}
            const overallGradeValue = renderOverallGradeValue(rowGrades.overall_grade)
            const fullName =
              `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
              student.name ||
              "Student"
            return (
              <tr key={student.id} className="tp-gradebook-row">
                <td className="tp-gradebook-td tp-gradebook-td--student">
                  <p className="tp-gradebook-student-email">{student.email || student.id}</p>
                  <p className="tp-gradebook-student-name">{fullName}</p>
                </td>
                {lessons.map((lesson) => {
                  const cell = rowGrades[String(lesson.id)] || {}
                  const cellValue = renderCellValue(cell)
                  return (
                    <td key={`${student.id}-${lesson.id}`} className="tp-gradebook-td">
                      <button
                        type="button"
                        className="tp-gradebook-grade-cell"
                        onClick={() => onEditCell(student, lesson, cell?.score)}
                        title="Click to edit grade"
                      >
                        <span
                          className={
                            cellValue.isMuted ? "tp-gradebook-grade-muted" : "tp-gradebook-grade-value"
                          }
                        >
                          {cellValue.text}
                        </span>
                        <Pencil className="tp-gradebook-grade-edit-icon" size={12} strokeWidth={2} aria-hidden />
                      </button>
                    </td>
                  )
                })}
                <td className="tp-gradebook-td">
                  <span
                    className={
                      overallGradeValue.isMuted
                        ? "tp-gradebook-grade-muted"
                        : "tp-gradebook-grade-overall"
                    }
                  >
                    {overallGradeValue.text}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
