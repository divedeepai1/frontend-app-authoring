import { useState } from "react"
import { Pencil } from "lucide-react"

const GradebookTable = ({
  lessons,
  students,
  gradesByStudent,
  editedLessonIds,
  onEditCell,
}) => {
  const [hoveredCellKey, setHoveredCellKey] = useState("")

  const renderCellValue = (cell) => {
    if (!cell || typeof cell !== "object") return { text: "Not graded", isMuted: true }
    if (cell.score === null || cell.score === undefined) return { text: "Not graded", isMuted: true }
    return { text: String(cell.score), isMuted: false }
  }

  if (!students.length) {
    return (
      <div className="text-center py-4" style={{ color: "#6B7280" }}>
        No students found for this class.
      </div>
    )
  }

  if (!lessons.length) {
    return (
      <div className="text-center py-4" style={{ color: "#6B7280" }}>
        No lessons found for this course.
      </div>
    )
  }

  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 4,
        overflow: "auto",
        maxHeight: "62vh",
      }}
    >
      <table className="table mb-0" style={{ fontSize: 12, minWidth: 900 }}>
        <thead style={{ backgroundColor: "#F3F4F6", position: "sticky", top: 0, zIndex: 2 }}>
          <tr>
            <th style={{ minWidth: 220, position: "sticky", left: 0, zIndex: 3, background: "#F3F4F6" }}>
              Student
            </th>
            {lessons.map((lesson) => (
              <th key={lesson.id} style={{ minWidth: 170 }}>
                <div style={{ fontWeight: 600 }} title={String(lesson.id)}>
                  {lesson.title}
                </div>
                {editedLessonIds.has(String(lesson.id)) && (
                  <div style={{ fontSize: 11, color: "#B45309" }}>Edited</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const rowGrades = gradesByStudent[String(student.id)] || {}
            return (
              <tr key={student.id}>
                <td style={{ position: "sticky", left: 0, zIndex: 1, background: "#fff" }}>
                  <div style={{ fontWeight: 500 }}>{student.name || "Student"}</div>
                  <div style={{ color: "#6B7280", fontSize: 11 }}>{student.email || student.id}</div>
                </td>
                {lessons.map((lesson) => {
                  const cell = rowGrades[String(lesson.id)] || {}
                  const cellValue = renderCellValue(cell)
                  const cellKey = `${student.id}-${lesson.id}`
                  return (
                    <td
                      key={cellKey}
                      onMouseEnter={() => setHoveredCellKey(cellKey)}
                      onMouseLeave={() => setHoveredCellKey("")}
                    >
                      <div className="d-flex align-items-center" style={{ gap: 8 }}>
                        <span style={{ color: cellValue.isMuted ? "#6B7280" : "#111827", fontWeight: cellValue.isMuted ? 400 : 500 }}>
                          {cellValue.text}
                        </span>
                        <button
                          type="button"
                          className="border-none bg-transparent p-0 d-flex align-items-center justify-content-center"
                          style={{
                            color: "#255A71",
                            cursor: "pointer",
                            opacity: hoveredCellKey === cellKey ? 1 : 0,
                            transition: "opacity 120ms ease",
                          }}
                          onClick={() => onEditCell(student, lesson, cell?.score)}
                          aria-label="Edit grade"
                          title="Edit grade"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default GradebookTable
