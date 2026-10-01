import TpLoadingState from "../../../components/common/TpLoadingState"
import { formatScore, scoreToneClass } from "../utils/scoreDisplay"

export default function GradeReportTable({ report, isLoading }) {
  if (isLoading) {
    return <TpLoadingState label="Loading grade report…" className="tp-reports-loading" />
  }

  if (!report?.rows?.length) {
    return <p className="tp-reports-empty">No grade report data for this class and course.</p>
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
              <th className="tp-reports-th tp-report-data-th tp-report-data-th--average">
                Average
              </th>
              {report.columns.map((column) => (
                <th
                  key={column.id}
                  className={`tp-reports-th tp-report-data-th${
                    column.isAssessment ? " tp-report-data-th--assessment" : ""
                  }`}
                  title={column.contentType || (column.isAssessment ? "Quiz / Test" : "Lesson")}
                >
                  <span className="tp-reports-th-label">{column.title}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr key={row.id} className="tp-reports-row tp-report-data-row">
                <td className="tp-reports-td tp-report-data-td tp-report-data-td--student">
                  {row.studentName}
                </td>
                <td className="tp-reports-td tp-report-data-td tp-report-data-td--average">
                  {formatScore(row.average)}
                </td>
                {report.columns.map((column) => {
                  const score = row.scores?.[column.id]
                  return (
                    <td
                      key={`${row.id}-${column.id}`}
                      className={`tp-reports-td tp-report-data-td tp-report-data-td--score ${scoreToneClass(score)}`}
                    >
                      {formatScore(score)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
