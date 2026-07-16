import ClassManagementForm from "../components/classes/manage-classes"
import AddTeacher from "../components/classes/add-teacher"
import TeacherPortalShell from "../layout/TeacherPortalShell"
import ManageClassModalFrame from "../modules/manage-classes/components/ManageClassModalFrame"
import { useLocation, useNavigate } from "react-router"
import { useCallback, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import * as teachersApi from "../modules/manage-classes/services/teachersApi"
import "../theme/teachers-portal-scope.css"

const ManageClasses = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const isNewTeacher = location.pathname.endsWith("/add-teacher")
  const isNewStudent = location.pathname.endsWith("/add-student")
  const [selectedTeachers, setSelectedTeachers] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)

  const closeWizard = useCallback(() => {
    sessionStorage.removeItem("classId")
    sessionStorage.removeItem("classData")
    sessionStorage.removeItem("manageClassMode")
    if (isNewStudent) {
      navigate(-1)
    } else {
      navigate("/classes")
    }
  }, [isNewStudent, navigate])

  const closeAddTeacher = useCallback(() => {
    navigate(-1)
  }, [navigate])

  useEffect(() => {
    if (!isNewTeacher) return
    let cancelled = false
    ;(async () => {
      setLoadingTeachers(true)
      try {
        const list = await teachersApi.fetchSchoolTeachers()
        if (!cancelled) setTeachers(list)
      } catch {
        if (!cancelled) setTeachers([])
      } finally {
        if (!cancelled) setLoadingTeachers(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isNewTeacher])

  const handleNextStep = async (e) => {
    e.preventDefault()
    const classId = sessionStorage.getItem("classId")
    const emails = selectedTeachers.map((t) => t.email)
    try {
      await teachersApi.postClassroomTeachers(classId, emails)
      navigate(-1)
    } catch {}
  }

  const classTitle = (() => {
    try {
      const raw = sessionStorage.getItem("classData")
      if (!raw) return "Class name"
      return JSON.parse(raw)?.name || "Class name"
    } catch {
      return "Class name"
    }
  })()

  const addTeachersSlot =
    !isNewStudent && !isNewTeacher ? (
      <button
        type="button"
        className="tp-btn tp-btn-secondary tp-mc-modal-header-btn"
        onClick={() => navigate("/manage-classes/add-teacher")}
      >
        <Plus size={16} strokeWidth={2} aria-hidden />
        Add more teachers
      </button>
    ) : null

  return (
    <div className="min-vh-100 bg-white d-flex flex-column">
      <div className="cms-tp-scope flex-grow-1 d-flex flex-column min-vh-0">
        <TeacherPortalShell headerTitle="Manage Classes & Students" headerSubtitle={classTitle}>
          <div className="tp-portal-page tp-manage-classes-modal-host">
            {isNewTeacher ? (
              <ManageClassModalFrame
                title="Add more teachers"
                subtitle="Select teachers from your school list or search by email."
                onClose={closeAddTeacher}
                showProgress={false}
                headerEnd={null}
                footer={null}
                compactBody
              >
                <div className="tp-mc-add-teacher-inner">
                  <AddTeacher
                    teachers={teachers}
                    loadingTeachers={loadingTeachers}
                    selectedTeachers={selectedTeachers}
                    setSelectedTeachers={setSelectedTeachers}
                    nextStep={handleNextStep}
                  />
                </div>
              </ManageClassModalFrame>
            ) : (
              <ClassManagementForm
                isNewStudent={isNewStudent}
                modalHeaderEnd={addTeachersSlot}
                onClose={closeWizard}
              />
            )}
          </div>
        </TeacherPortalShell>
      </div>
    </div>
  )
}

export default ManageClasses
