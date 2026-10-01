import TeacherPortalShell from "../layout/TeacherPortalShell"
import HomeApp from "../modules/home/HomeApp"
import "../theme/teachers-portal-scope.css"

const HomePage = () => (
  <div className="min-vh-100 bg-white d-flex flex-column">
    <div className="cms-tp-scope flex-grow-1 d-flex flex-column min-vh-0">
      <TeacherPortalShell headerTitle="Home">
        <HomeApp />
      </TeacherPortalShell>
    </div>
  </div>
)

export default HomePage
