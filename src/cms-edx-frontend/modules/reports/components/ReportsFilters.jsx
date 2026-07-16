import { BarChart3 } from "lucide-react"
import ReportTypeFilter from "./ReportTypeFilter"

export default function ReportsFilters({
  classes,
  courses,
  selectedClassId,
  selectedCourseId,
  reportType,
  onClassChange,
  onCourseChange,
  onReportTypeChange,
}) {
  return (
    <div className="tp-reports-filters-head">
      <div className="tp-reports-filters-brand">
        <div className="tp-reports-filters-icon" aria-hidden>
          <BarChart3 size={20} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <h3 className="tp-reports-filters-title">Reports</h3>
          <p className="tp-reports-filters-desc">
            Grade, activity, and overdue reports by class and course
          </p>
        </div>
      </div>

      <div className="tp-reports-filters-toolbar">
        <div className="tp-reports-filters-row">
          <div className="tp-reports-inline-field">
            <label htmlFor="tp-reports-class" className="tp-reports-inline-label">
              Select Class:
            </label>
            <select
              id="tp-reports-class"
              className="tp-reports-select"
              value={selectedClassId}
              onChange={(e) => onClassChange(e.target.value)}
            >
              {Array.isArray(classes) && classes.length > 0 ? (
                classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))
              ) : (
                <option value="">No classes available</option>
              )}
            </select>
          </div>

          <div className="tp-reports-inline-field">
            <label htmlFor="tp-reports-course" className="tp-reports-inline-label">
              Select Course:
            </label>
            <select
              id="tp-reports-course"
              className="tp-reports-select tp-reports-select-wide"
              value={selectedCourseId}
              onChange={(e) => onCourseChange(e.target.value)}
            >
              {Array.isArray(courses) && courses.length > 0 ? (
                courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.display_name}
                  </option>
                ))
              ) : (
                <option value="">No courses</option>
              )}
            </select>
          </div>
        </div>

        <ReportTypeFilter value={reportType} onChange={onReportTypeChange} />
      </div>
    </div>
  )
}
