import TeacherPortalSidebar from "./TeacherPortalSidebar"
import TeacherPortalHeader from "./TeacherPortalHeader"
import TpToastProvider from "../components/common/TpToastProvider"
import { DistrictSchoolProvider } from "../modules/district-school/context/DistrictSchoolContext"
import { UserProfileProvider } from "../modules/user-profile/context/UserProfileContext"
import InactivityLogoutWatcher from "../session/InactivityLogoutWatcher"

export default function TeacherPortalShell({ children, headerTitle, headerSubtitle }) {
  return (
    <TpToastProvider>
      <UserProfileProvider>
        <DistrictSchoolProvider>
          <div className="tp-portal-body">
            <TeacherPortalSidebar />
            <div className="tp-portal-column">
              <TeacherPortalHeader title={headerTitle} subtitle={headerSubtitle} />
              <main className="tp-portal-main">{children}</main>
            </div>
          </div>
          <InactivityLogoutWatcher />
        </DistrictSchoolProvider>
      </UserProfileProvider>
    </TpToastProvider>
  )
}
