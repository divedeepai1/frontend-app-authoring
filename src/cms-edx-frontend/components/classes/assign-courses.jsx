import { File } from "lucide-react"
import TpCheckbox from "../common/TpCheckbox"

const AssignCourses = ({
  formData,
  handleCourseSelection,
  nextStep,
  prevStep,
  courses,
  embedInModal = false,
}) => (
  <div className="tp-assign-courses">
    {courses.length > 0 ? (
      <>
        <h3 className="tp-title">Assign courses</h3>
        <p className="tp-subtitle">Select one or more courses for this class.</p>
        <div className="tp-course-grid">
          {courses.map((course, index) => (
            <div
              key={course.id || index}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleCourseSelection(course.id)
                }
              }}
              className={`tp-course-card${formData.courses.includes(course.id) ? " tp-selected" : ""}`}
              onClick={() => handleCourseSelection(course.id)}
            >
              <div className="tp-checkbox-tl" onClick={(e) => e.stopPropagation()}>
                <TpCheckbox
                  id={`course-${course.id}`}
                  checked={formData.courses.includes(course.id)}
                  onChange={() => handleCourseSelection(course.id)}
                  ariaLabel={`Select ${course.display_name}`}
                />
              </div>
              <File size={36} color="#475569" />
              <h4 className="tp-course-title">{course.display_name}</h4>
            </div>
          ))}
        </div>
      </>
    ) : (
      <h4 className="tp-title tp-center-msg">No courses found for this teacher</h4>
    )}
    {!embedInModal ? (
      <div className="tp-assign-footer">
        <div className="tp-actions-row">
          <button type="button" className="tp-btn tp-btn-primary" onClick={() => nextStep()}>
            Finish
          </button>
          <button type="button" className="tp-btn tp-btn-secondary" onClick={prevStep}>
            Back
          </button>
        </div>
        <a href="#save-later" className="tp-muted-link" onClick={(e) => e.preventDefault()}>
          Save information for later
        </a>
      </div>
    ) : null}
  </div>
)

export default AssignCourses
