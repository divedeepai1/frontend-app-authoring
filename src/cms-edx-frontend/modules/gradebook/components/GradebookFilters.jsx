import { BookOpen } from "lucide-react"
import courseWeightMessages from "../../../../course-outline/course-weight-settings-modal/messages"

export default function GradebookFilters({
  classes,
  courses,
  selectedClassId,
  selectedCourseId,
  onClassChange,
  onCourseChange,
  onOpenWeightSettings,
  weightDisabled,
}) {
  return (
    <div className="tp-gradebook-filters-head">
      <div className="tp-gradebook-filters-brand">
        <div className="tp-gradebook-filters-icon" aria-hidden>
          <BookOpen size={20} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <h3 className="tp-gradebook-filters-title">Class Gradebook</h3>
          <p className="tp-gradebook-filters-desc">View and manage student grades by class and course</p>
        </div>
      </div>
      <div className="tp-gradebook-filters-row">
        <div className="tp-gradebook-inline-field">
          <label htmlFor="tp-gradebook-class" className="tp-gradebook-inline-label">
            Select Class:
          </label>
          <select
            id="tp-gradebook-class"
            className="tp-gradebook-select"
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
        <div className="tp-gradebook-inline-field">
          <label htmlFor="tp-gradebook-course" className="tp-gradebook-inline-label">
            Select Course:
          </label>
          <select
            id="tp-gradebook-course"
            className="tp-gradebook-select tp-gradebook-select-wide"
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
        <button
          type="button"
          className="tp-btn tp-btn-secondary"
          onClick={onOpenWeightSettings}
          disabled={weightDisabled}
        >
          {courseWeightMessages.openButton.defaultMessage}
        </button>
      </div>
    </div>
  )
}
