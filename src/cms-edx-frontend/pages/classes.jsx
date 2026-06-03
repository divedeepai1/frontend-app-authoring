import ClassesTable from "../components/classes/classes-table"
import TeacherPortalShell from "../layout/TeacherPortalShell"
import { useEffect, useState } from "react"
import * as classroomApi from "../modules/manage-classes/services/classroomApi"
import "../theme/teachers-portal-scope.css"

const Classes = () => {
  const [classes, setClasses] = useState([])

  useEffect(() => {
    sessionStorage.removeItem("classId")
    sessionStorage.removeItem("classData")
    sessionStorage.removeItem("manageClassMode")
    let cancelled = false
    ;(async () => {
      try {
        const result = await classroomApi.fetchClassrooms()
        if (!cancelled) setClasses(result?.classrooms ?? [])
      } catch {
        if (!cancelled) setClasses([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-vh-100 bg-white d-flex flex-column">
      <div className="cms-tp-scope flex-grow-1 d-flex flex-column min-vh-0">
        <TeacherPortalShell headerTitle="Manage Classes & Students">
          <div className="tp-portal-page">
            {/* <div className="tp-print-toolbar">
              <button type="button" className="tp-btn tp-btn-ghost">
                Print completion certificate
              </button>
              <button type="button" className="tp-btn tp-btn-ghost">
                Print parent letter
              </button>
            </div> */}
            <ClassesTable classes={classes} setClasses={setClasses} />
          </div>
        </TeacherPortalShell>
      </div>
    </div>
  )
}

export default Classes
