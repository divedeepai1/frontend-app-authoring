import ClassesTable from "../components/classes/classes-table"
import TeacherPortalShell from "../layout/TeacherPortalShell"
import { useEffect } from "react"
import "../theme/teachers-portal-scope.css"

const Classes = () => {
  useEffect(() => {
    sessionStorage.removeItem("classId")
    sessionStorage.removeItem("classData")
    sessionStorage.removeItem("manageClassMode")
  }, [])

  return (
    <div className="min-vh-100 bg-white d-flex flex-column">
      <div className="cms-tp-scope flex-grow-1 d-flex flex-column min-vh-0">
        <TeacherPortalShell headerTitle="Manage Classes, Students, and Assign Courses">
          <div className="tp-portal-page">
            <ClassesTable />
          </div>
        </TeacherPortalShell>
      </div>
    </div>
  )
}

export default Classes
