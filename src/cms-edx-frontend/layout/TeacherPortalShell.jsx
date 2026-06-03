import TeacherPortalSidebar from "./TeacherPortalSidebar"
import TeacherPortalHeader from "./TeacherPortalHeader"
import TpToastProvider from "../components/common/TpToastProvider"

export default function TeacherPortalShell({ children, headerTitle, headerSubtitle }) {
  return (
    <TpToastProvider>
      <div className="tp-portal-body">
        <TeacherPortalSidebar />
        <div className="tp-portal-column">
          <TeacherPortalHeader title={headerTitle} subtitle={headerSubtitle} />
          <main className="tp-portal-main">{children}</main>
        </div>
      </div>
    </TpToastProvider>
  )
}
