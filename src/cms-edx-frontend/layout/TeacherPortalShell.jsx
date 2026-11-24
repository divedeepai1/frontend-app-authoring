import { useEffect, useRef } from "react"
import TeacherPortalSidebar from "./TeacherPortalSidebar"
import TeacherPortalHeader from "./TeacherPortalHeader"
import TpToastProvider from "../components/common/TpToastProvider"
import { DistrictSchoolProvider } from "../modules/district-school/context/DistrictSchoolContext"
import { UserProfileProvider } from "../modules/user-profile/context/UserProfileContext"
import InactivityLogoutWatcher from "../session/InactivityLogoutWatcher"
import {
  HealthEvent,
  reportHealth,
  syncTelemetryUserId,
} from "../modules/errorLogging"
import TelemetryErrorBoundary from "../modules/errorLogging/TelemetryErrorBoundary"

export default function TeacherPortalShell({ children, headerTitle, headerSubtitle }) {
  const reportedReady = useRef(false)

  useEffect(() => {
    void syncTelemetryUserId()
    if (reportedReady.current) return
    reportedReady.current = true
    reportHealth(HealthEvent.APP_READY, {
      "app.shell": "teacher-portal",
    })
  }, [])

  return (
    <TpToastProvider>
      <UserProfileProvider>
        <DistrictSchoolProvider>
          <TelemetryErrorBoundary>
            <div className="tp-portal-body">
              <TeacherPortalSidebar />
              <div className="tp-portal-column">
                <TeacherPortalHeader title={headerTitle} subtitle={headerSubtitle} />
                <main className="tp-portal-main">{children}</main>
              </div>
            </div>
            <InactivityLogoutWatcher />
          </TelemetryErrorBoundary>
        </DistrictSchoolProvider>
      </UserProfileProvider>
    </TpToastProvider>
  )
}
