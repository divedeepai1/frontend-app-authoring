import TeacherPortalShell from "../layout/TeacherPortalShell"
import ReportsApp from "../modules/reports/ReportsApp"
import "../theme/teachers-portal-scope.css"

const Reports = () => (
  <div className="min-vh-100 bg-white d-flex flex-column">
    <div className="cms-tp-scope flex-grow-1 d-flex flex-column min-vh-0">
      <TeacherPortalShell headerTitle="Reports">
        <div className="tp-portal-page">
          <ReportsApp />
        </div>
      </TeacherPortalShell>
    </div>
  </div>
)

export default Reports
