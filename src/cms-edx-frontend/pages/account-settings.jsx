import AccountSettingsApp from "../modules/account-settings/AccountSettingsApp"
import TeacherPortalShell from "../layout/TeacherPortalShell"
import "../theme/teachers-portal-scope.css"

const AccountSettingsPage = () => (
  <div className="min-vh-100 bg-white d-flex flex-column">
    <div className="cms-tp-scope flex-grow-1 d-flex flex-column min-vh-0">
      <TeacherPortalShell>
        <div className="tp-portal-page">
          <AccountSettingsApp />
        </div>
      </TeacherPortalShell>
    </div>
  </div>
)

export default AccountSettingsPage
