import {File} from "lucide-react"
import { useNavigate } from "react-router";
const AssignCourses = ({
  formData,
  handleCourseSelection,
  nextStep,
  prevStep,
  courses,
  setCourses,
}) => {
  const navigate= useNavigate();
  return (
  <div className="p-4 class-div-style">
    {courses.length > 0 ?<>
    <h3 className="primary-text mb-3">Assign Courses</h3>
    <p className="mb-4">
      These are your courses and you can assign multiple courses to
      any class.
    </p>

    <div className="row mb-4">
  <div className="col-md-12">
    <div className="d-flex flex-wrap" style={{ alignItems: "stretch" , gap:"20px" }}>
      {courses &&
        courses.map((course, index) => (
          <div
            key={course.id || index}
            className="card position-relative d-flex justify-content-center"
            style={{
              width: "200px",
              minHeight: "180px",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div className="text-center p-3">
              <File className="mb-2" size={40} />
              <h5 className="mt-2">{course.display_name}</h5>
            </div>
            <div
              className="checkbox-wrapper form-check position-absolute"
              style={{ top: "-8px", right: "-8px" }}
            >
              <label htmlFor={course.id} className="form-check-label">
                <input
                  type="checkbox"
                  id={course.id}
                  name="class-header"
                  checked={formData.courses.includes(course.id)}
                  onChange={() => handleCourseSelection(course.id)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom">
                  {formData.courses.includes(course.id) && (
                    <svg className="checkmark" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M20.285 6.709l-11.4 11.4-5.6-5.6L5.7 10.09l3.186 3.186 9.714-9.714z"
                      />
                    </svg>
                  )}
                </span>
              </label>
            </div>
          </div>
        ))}
    </div>
  </div>
</div>


    {/* <button className="btn btn-outline-primary mb-4"
    //  onClick={(e)=> navigate("/curriculum")}
     >
      View Course Library
    </button> */}
    </>:
    <>
    <h4 className="primary-text text-center py-4">No courses found for this teacher</h4>

    </>}

    <div className="d-flex  justify-content-between">
      <div className="d-flex">
        <button className="primary-button px-4 py-2" onClick={nextStep}>
          Finish
        </button>
        <button className="secondary-button px-4 ml-3" onClick={prevStep}>
          Back
        </button>
      </div>
      <div className="ms-auto">
        <a href="#" className="primary-text">
          Save Information for Later
        </a>
      </div>
    </div>
  </div>
);
}
export default AssignCourses;
