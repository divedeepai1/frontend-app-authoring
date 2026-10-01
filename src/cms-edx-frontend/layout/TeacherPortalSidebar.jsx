import { BookOpen, ClipboardList, FileText, FolderOpen, Home, Users } from "lucide-react"
import { useNavigate, useLocation } from "react-router"
import { getTeacherPortalTabId } from "./getTeacherPortalTabId"
import compugradeLogo from "../assests/Logo.png"

const NAV = [
  { id: "home", label: "Home", icon: Home, path: "/home" },
  {
    id: "manage-class-students",
    label: "Manage Classes, Students, and Assign Courses",
    labelLines: ["Manage Classes, Students, and", "Assign Courses"],
    icon: Users,
    path: "/classes",
  },
  {
    id: "manage-course-curriculum",
    label: "Manage Courses & Set Preferences",
    icon: BookOpen,
    path: "/curriculum",
  },
  { id: "gradebook", label: "Gradebook", icon: ClipboardList, path: "/curriculum/gradebook" },
  { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
  { id: "additional-resources", label: "Teacher Materials", icon: FolderOpen, path: "/resources" },
]

export default function TeacherPortalSidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const activeTab = getTeacherPortalTabId(pathname)

  return (
    <aside className="tp-sidebar" aria-label="Teacher portal navigation">
      <div className="tp-sidebar-brand">
        <div className="tp-sidebar-logo">
          <img src={compugradeLogo} alt="Compugrade logo" className="tp-sidebar-logo-image" />
        </div>
      </div>
      <nav className="tp-sidebar-nav">
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const lines = Array.isArray(item.labelLines) && item.labelLines.length
            ? item.labelLines
            : [item.label]
          return (
            <button
              key={item.id}
              type="button"
              className={`tp-sidebar-link${isActive ? " tp-sidebar-link-active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="tp-sidebar-icon" strokeWidth={1.67} aria-hidden />
              <span className="tp-sidebar-label">
                {lines.map((line) => (
                  <span key={line} className="tp-sidebar-label-line">
                    {line}
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
