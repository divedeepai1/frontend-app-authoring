import ChangeEmailCard from "./components/ChangeEmailCard"
import ChangePasswordCard from "./components/ChangePasswordCard"
import "../../theme/teachers-portal-scope.css"

export default function AccountSettingsApp() {
  return (
    <div className="tp-account-settings">
      <header className="tp-account-settings-header">
        <h1 className="tp-account-settings-title">Account Settings</h1>
        <p className="tp-account-settings-subtitle">Manage your password and email address.</p>
      </header>

      <div className="tp-account-settings-grid">
        <ChangePasswordCard />
        <ChangeEmailCard />
      </div>
    </div>
  )
}
