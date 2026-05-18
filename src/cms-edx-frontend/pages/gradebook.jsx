import TeacherPortalShell from "../layout/TeacherPortalShell"
import GradebookApp from "../modules/gradebook/GradebookApp"
import "../theme/teachers-portal-scope.css"

const Gradebook = () => (
  <div className="min-vh-100 bg-white d-flex flex-column">
    <div className="cms-tp-scope flex-grow-1 d-flex flex-column min-vh-0">
      <TeacherPortalShell headerTitle="Manage Courses & Curriculum" headerSubtitle="Class gradebook">
        <div className="tp-portal-page">
          <GradebookApp />
        </div>
      </TeacherPortalShell>
    </div>
  </div>
)

export default Gradebook
