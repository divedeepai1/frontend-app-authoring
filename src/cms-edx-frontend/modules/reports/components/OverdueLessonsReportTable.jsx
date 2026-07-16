import TpLoadingState from "../../../components/common/TpLoadingState"

function formatValue(value) {
  if (value == null || value === "") return "—"
  return String(value)
}

export default function OverdueLessonsReportTable({ rows, isLoading }) {
  if (isLoading) {
    return <TpLoadingState label="Loading overdue lessons report…" className="tp-reports-loading" />
  }

  if (!rows?.length) {
    return <p className="tp-reports-empty">No overdue lessons for this class and course.</p>
  }

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
              <th className="tp-reports-th tp-report-data-th">Due Date</th>
              <th className="tp-reports-th tp-report-data-th">Days Overdue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const typeLower = String(row.type || "").toLowerCase()
              const isAssessment = typeLower.includes("assessment")
              return (
                <tr key={row.id} className="tp-reports-row tp-report-data-row">
                  <td className="tp-reports-td tp-report-data-td tp-report-data-td--student">
                    {row.studentName}
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
                  <td className="tp-reports-td tp-report-data-td">{formatValue(row.dueDate)}</td>
                  <td className="tp-reports-td tp-report-data-td tp-report-data-td--overdue">
                    {formatValue(row.daysOverdue)}
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
