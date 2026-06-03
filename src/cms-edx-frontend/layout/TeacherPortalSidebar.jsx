import { Home, Users, BookOpen, FileText, FolderOpen } from "lucide-react"
import { useNavigate, useLocation } from "react-router"
import { getTeacherPortalTabId } from "./getTeacherPortalTabId"

const NAV = [
  { id: "home", label: "Home", icon: Home, path: "/home" },
  { id: "manage-class-students", label: "Manage Class & Students", icon: Users, path: "/classes" },
  { id: "manage-course-curriculum", label: "Manage Course & Curriculum", icon: BookOpen, path: "/curriculum" },
  { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
  { id: "additional-resources", label: "Additional Resources", icon: FolderOpen, path: "/resources" },
]

export default function TeacherPortalSidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const activeTab = getTeacherPortalTabId(pathname)

  return (
    <aside className="tp-sidebar" aria-label="Teacher portal navigation">
      <div className="tp-sidebar-brand">
        <div className="tp-sidebar-logo">
          <Users size={20} strokeWidth={2} color="#fff" aria-hidden />
        </div>
        <span className="tp-sidebar-title">Compugrade</span>
      </div>
      <nav className="tp-sidebar-nav">
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={`tp-sidebar-link${isActive ? " tp-sidebar-link-active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="tp-sidebar-icon" strokeWidth={1.67} aria-hidden />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
