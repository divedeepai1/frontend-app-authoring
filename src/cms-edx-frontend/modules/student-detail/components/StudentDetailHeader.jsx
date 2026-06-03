import { ChevronDown } from "lucide-react"

export default function StudentDetailHeader({
  className,
  studentName,
  courseName,
  courses,
  selectedCourseId,
  onCourseChange,
}) {
  return (
    <div className="tp-student-detail-header">
      <div className="tp-student-detail-breadcrumb">
        <span className="tp-student-detail-crumb">{className || "Class"}</span>
        <span className="tp-student-detail-crumb-sep">›</span>
        <span className="tp-student-detail-crumb tp-student-detail-crumb--active">{studentName || "Student"}</span>
        {courseName ? (
          <>
            <span className="tp-student-detail-crumb-sep">›</span>
            <span className="tp-student-detail-crumb tp-student-detail-crumb--muted">{courseName}</span>
          </>
        ) : null}
      </div>
      <div className="tp-student-detail-course-field">
        <label htmlFor="tp-student-course" className="tp-student-detail-course-label">
          Select Course:
        </label>
        <div className="tp-student-detail-select-wrap">
          <select
            id="tp-student-course"
            className="tp-student-detail-select"
            value={selectedCourseId}
            onChange={(e) => {
              const course = courses.find((c) => String(c.id) === String(e.target.value))
              if (course) onCourseChange(course)
            }}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.display_name}
              </option>
            ))}
          </select>
          <ChevronDown className="tp-student-detail-select-chevron" size={16} strokeWidth={2} aria-hidden />
        </div>
      </div>
    </div>
  )
}
