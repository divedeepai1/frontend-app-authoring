import TpLoadingState from "../../../components/common/TpLoadingState"
import { formatScore, scoreToneClass } from "../utils/scoreDisplay"

function formatValue(value) {
  if (value == null || value === "") return "—"
  return String(value)
}

export default function LessonActivityReportTable({ rows, isLoading }) {
  if (isLoading) {
    return <TpLoadingState label="Loading lesson activity report…" className="tp-reports-loading" />
  }

  if (!rows?.length) {
    return <p className="tp-reports-empty">No lesson activity data for this class and course.</p>
  }

  let lastStudent = null

  return (
    <div className="tp-report-view">
      <div className="tp-reports-table-wrap tp-report-data-wrap">
        <table className="tp-reports-table tp-report-data-table">
          <thead>
            <tr>
              <th className="tp-reports-th tp-report-data-th tp-report-data-th--student">
                Student Name
              </th>
              <th className="tp-reports-th tp-report-data-th">Lesson Name</th>
              <th className="tp-reports-th tp-report-data-th">Type</th>
              <th className="tp-reports-th tp-report-data-th">Attempt #</th>
              <th className="tp-reports-th tp-report-data-th">Score</th>
              <th className="tp-reports-th tp-report-data-th">Timer Duration</th>
              <th className="tp-reports-th tp-report-data-th">Time to Complete</th>
              <th className="tp-reports-th tp-report-data-th">Submitted Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isNewStudentGroup = row.studentName !== lastStudent
              lastStudent = row.studentName
              const typeLower = String(row.type || "").toLowerCase()
              const isAssessment = typeLower.includes("assessment")
              return (
                <tr
                  key={row.id}
                  className={`tp-reports-row tp-report-data-row${
                    isNewStudentGroup ? " tp-reports-row--group-start" : ""
                  }`}
                >
                  <td className="tp-reports-td tp-report-data-td tp-report-data-td--student">
                    {isNewStudentGroup ? row.studentName : ""}
                  </td>
                  <td className="tp-reports-td tp-report-data-td tp-report-data-td--left">
                    {row.lessonName}
                  </td>
                  <td
                    className={`tp-reports-td tp-report-data-td${
                      isAssessment ? " tp-report-data-td--type-assessment" : ""
                    }`}
                  >
                    {row.type}
                  </td>
                  <td className="tp-reports-td tp-report-data-td">
                    {formatValue(row.attemptNumber)}
                  </td>
                  <td
                    className={`tp-reports-td tp-report-data-td tp-report-data-td--score ${scoreToneClass(row.score)}`}
                  >
                    {formatScore(row.score)}
                  </td>
                  <td className="tp-reports-td tp-report-data-td tp-report-data-td--muted">
                    {row.timerDuration || "N/A"}
                  </td>
                  <td className="tp-reports-td tp-report-data-td">
                    {formatValue(row.timeToComplete)}
                  </td>
                  <td className="tp-reports-td tp-report-data-td">
                    {formatValue(row.submittedDate)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
