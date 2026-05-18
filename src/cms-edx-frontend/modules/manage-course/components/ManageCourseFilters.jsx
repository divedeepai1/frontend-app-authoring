import { BookOpen } from "lucide-react"

export default function ManageCourseFilters({
  classes,
  courses,
  selectedClassId,
  selectedCourseId,
  onClassChange,
  onCourseChange,
}) {
  return (
    <div className="tp-curriculum-filters-head">
      <div className="tp-curriculum-filters-brand">
        <div className="tp-curriculum-filters-icon" aria-hidden>
          <BookOpen size={20} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <h3 className="tp-curriculum-filters-title">Manage Course &amp; Curriculum</h3>
          <p className="tp-curriculum-filters-desc">Configure course content and curriculum structure</p>
        </div>
      </div>
      <div className="tp-curriculum-filters-row">
        <div className="tp-curriculum-inline-field">
          <label htmlFor="tp-curriculum-class" className="tp-curriculum-inline-label">
            Select Class:
          </label>
          <select
            id="tp-curriculum-class"
            className="tp-curriculum-select"
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
              <option value="">No relevant class</option>
            )}
          </select>
        </div>
        <div className="tp-curriculum-inline-field">
          <label htmlFor="tp-curriculum-course" className="tp-curriculum-inline-label">
            Select Course:
          </label>
          <select
            id="tp-curriculum-course"
            className="tp-curriculum-select tp-curriculum-select-wide"
            value={selectedCourseId}
            onChange={(e) => onCourseChange(e.target.value)}
          >
            {Array.isArray(courses) && courses.length > 0 ? (
              courses.map((crs) => (
                <option key={crs.id} value={crs.id}>
                  {crs.display_name}
                </option>
              ))
            ) : (
              <option value="">No courses</option>
            )}
          </select>
        </div>
      </div>
    </div>
  )
}
