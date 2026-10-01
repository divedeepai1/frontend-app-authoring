export function getTeacherPortalTabId(pathname) {
  if (!pathname) return "home"
  if (pathname === "/home" || pathname.startsWith("/home/")) return "home"
  if (pathname.startsWith("/classes") || pathname.startsWith("/manage-classes")) {
    return "manage-class-students"
  }
  // Gradebook must be checked before the broader /curriculum match.
  if (pathname.startsWith("/curriculum/gradebook")) return "gradebook"
  if (pathname.startsWith("/curriculum")) return "manage-course-curriculum"
  if (pathname.startsWith("/reports")) return "reports"
  if (pathname.startsWith("/resources")) return "additional-resources"
  return "home"
}
