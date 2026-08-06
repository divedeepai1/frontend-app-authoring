import TeacherPortalShell from "../layout/TeacherPortalShell"
import ManageCourseApp from "../modules/manage-course/ManageCourseApp"
import "../theme/teachers-portal-scope.css"

const Courses = () => (
  <div className="min-vh-100 bg-white d-flex flex-column">
    <div className="cms-tp-scope flex-grow-1 d-flex flex-column min-vh-0">
      <TeacherPortalShell headerTitle="Manage Courses & Set Preferences">
        <div className="tp-portal-page">
          <ManageCourseApp />
        </div>
      </TeacherPortalShell>
    </div>
  </div>
)

export default Courses
