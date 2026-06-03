export default function ResourcesFiltersBar({
  classes,
  courses,
  selectedClassId,
  selectedCourseId,
  onClassChange,
  onCourseChange,
  onAddResource,
}) {
  return (
    <div className="tp-resources-toolbar">
      <div className="tp-resources-filters">
        <div className="tp-resources-inline-field">
          <label className="tp-resources-inline-label" htmlFor="tp-res-class">
            All Resources:
          </label>
          <select
            id="tp-res-class"
            className="tp-resources-select tp-resources-select-wide"
            value={selectedClassId}
            onChange={(e) => onClassChange(e.target.value)}
            aria-label="Filter by class"
          >
            {Array.isArray(classes) && classes.length > 0 ? (
              <>
                <option value="">All Resources</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </>
            ) : (
              <option value="">No class available</option>
            )}
          </select>
        </div>
        <div className="tp-resources-inline-field">
          <label className="tp-resources-inline-label" htmlFor="tp-res-course">
            All Courses:
          </label>
          <select
            id="tp-res-course"
            className="tp-resources-select tp-resources-select-wide"
            value={selectedCourseId}
            onChange={(e) => onCourseChange(e.target.value)}
            aria-label="Filter by course"
          >
            {Array.isArray(courses) && courses.length > 0 ? (
              <>
                <option value="">All Courses</option>
                {courses.map((crs) => (
                  <option key={crs.id} value={crs.id}>
                    {crs.display_name}
                  </option>
                ))}
              </>
            ) : (
              <option value="">No courses</option>
            )}
          </select>
        </div>
      </div>
      <button type="button" className="tp-btn tp-btn-primary tp-resources-add" onClick={onAddResource}>
        Add resources
      </button>
    </div>
  )
}
