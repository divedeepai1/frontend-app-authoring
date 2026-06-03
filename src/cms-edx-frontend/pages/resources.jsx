import TeacherPortalShell from "../layout/TeacherPortalShell"
import { Resources } from "../components/resources"
import "../theme/teachers-portal-scope.css"

const ResourcesPage = () => (
  <div className="min-vh-100 bg-white d-flex flex-column">
    <div className="cms-tp-scope flex-grow-1 d-flex flex-column min-vh-0">
      <TeacherPortalShell headerTitle="Additional Resources">
        <div className="tp-portal-page">
          <Resources />
        </div>
      </TeacherPortalShell>
    </div>
  </div>
)

export default ResourcesPage
