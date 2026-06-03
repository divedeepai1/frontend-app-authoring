import { BarChart3 } from "lucide-react"

export default function ReportsFilters({
  classes,
  selectedClassId,
  onClassChange,
  reportDate,
  onReportDateChange,
  onGenerateReport,
  generating,
  allClassesValue,
}) {
  return (
    <div className="tp-reports-filters-head">
      <div className="tp-reports-filters-brand">
        <div className="tp-reports-filters-icon" aria-hidden>
          <BarChart3 size={20} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <h3 className="tp-reports-filters-title">Reports</h3>
          <p className="tp-reports-filters-desc">Class and student analytics overview</p>
        </div>
      </div>
      <div className="tp-reports-filters-row">
        <div className="tp-reports-inline-field">
          <label htmlFor="tp-reports-class" className="tp-reports-inline-label">
            Select Class:
          </label>
          <select
            id="tp-reports-class"
            className="tp-reports-select tp-reports-select-wide"
            value={selectedClassId}
            onChange={(e) => onClassChange(e.target.value)}
          >
            <option value={allClassesValue}>All Classes</option>
            {Array.isArray(classes) && classes.length > 0 ? (
              classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No classes available
              </option>
            )}
          </select>
        </div>
        <div className="tp-reports-inline-field">
          <label htmlFor="tp-reports-date" className="tp-reports-inline-label">
            Report Date:
          </label>
          <input
            id="tp-reports-date"
            type="date"
            className="tp-reports-date-input"
            value={reportDate}
            onChange={(e) => onReportDateChange(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="tp-btn tp-btn-primary"
          onClick={onGenerateReport}
          disabled={generating}
        >
          {generating ? "Loading..." : "Generate Report"}
        </button>
      </div>
    </div>
  )
}
