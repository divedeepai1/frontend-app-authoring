import TpDeleteConfirmationModal from "../components/common/TpDeleteConfirmationModal"
import TpPortalSearchField from "../components/common/TpPortalSearchField"
import TeacherPortalShell from "../layout/TeacherPortalShell"
import ManageClassModalFrame from "../modules/manage-classes/components/ManageClassModalFrame"
import MoveStudentModal from "../modules/manage-classes/components/MoveStudentModal"
import { useMoveStudent } from "../modules/manage-classes/hooks/useMoveStudent"
import { useNavigate, useParams } from "react-router"
import { fetchCsrfToken } from "../../cms-csrftoken"
import { getConfig } from "@edx/frontend-platform"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Pencil } from "lucide-react"
import TeachersTable from "../components/classes/teachers-table"
import StudentTable from "../components/classes/students-table"
import { tpToast } from "../components/common/tpToast"
import * as classroomApi from "../modules/manage-classes/services/classroomApi"
import { formatClassCreatedDate } from "../modules/manage-classes/utils/formatClassDate"
import "../theme/teachers-portal-scope.css"

const Teachers = () => {
  const { classId } = useParams()
  const navigate = useNavigate()

  const [teacherState, setTeacherState] = useState({
    list: [],
    selectedEmails: [],
    showDeleteModal: false,
  })

  const [teacherSearch, setTeacherSearch] = useState("")
  const [loadingTeachers, setLoadingTeachers] = useState(true)

  const [studentState, setStudentState] = useState({
    list: [],
    selectedIds: [],
    showDeleteModal: false,
  })

  const [studentSearch, setStudentSearch] = useState("")
  const [loadingStudents, setLoadingStudents] = useState(true)

  const pendingTeacherDeleteRef = useRef([])
  const pendingStudentDeleteRef = useRef([])

  const classMeta = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("classData")
      if (!raw) return null
      const d = JSON.parse(raw)
      return d && typeof d === "object" ? d : null
    } catch {
      return null
    }
  }, [classId])

  const modalTitle = classMeta?.name?.trim() || `Class ${classId}`
  const createdLabel = formatClassCreatedDate(
    classMeta?.created_at || classMeta?.created || classMeta?.date_created
  )
  const modalSubtitle = createdLabel
    ? `Created ${createdLabel}. View teachers and students assigned to this class.`
    : "View teachers and students assigned to this class."

  const closeClassView = useCallback(() => {
    navigate("/classes")
  }, [navigate])

  const goEditClass = useCallback(() => {
    sessionStorage.setItem("manageClassMode", "edit")
    sessionStorage.setItem("classId", String(classId))
    if (!sessionStorage.getItem("classData") && classMeta) {
      sessionStorage.setItem("classData", JSON.stringify(classMeta))
    }
    navigate("/manage-classes/1")
  }, [classId, classMeta, navigate])

  const fetchTeachers = async () => {
    setLoadingTeachers(true)
    const token = await fetchCsrfToken()
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/teachers/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get: ${response.status} ${errorText}`)
      }
      const result = await response.json()
      setTeacherState((prev) => ({ ...prev, list: result?.all_teachers || [] }))
    } catch {
      setTeacherState((prev) => ({ ...prev, list: [] }))
    } finally {
      setLoadingTeachers(false)
    }
  }

  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true)
    const token = await fetchCsrfToken()
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/students-list/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get: ${response.status} ${errorText}`)
      }
      const result = await response.json()
      setStudentState((prev) => ({ ...prev, list: result?.students || [] }))
    } catch {
      setStudentState((prev) => ({ ...prev, list: [] }))
    } finally {
      setLoadingStudents(false)
    }
  }, [classId])

  const moveStudent = useMoveStudent({
    sourceClassId: classId,
    sourceClass: classMeta,
    onMoved: fetchStudents,
  })

  useEffect(() => {
    sessionStorage.setItem("classId", classId)
    fetchStudents()
    fetchTeachers()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload lists when class id changes
  }, [classId])

  const filteredTeachers = teacherState.list.filter((t) => {
    const q = teacherSearch.trim().toLowerCase()
    if (!q) return true
    return (
      (t.username || "").toLowerCase().includes(q) ||
      (t.email || "").toLowerCase().includes(q)
    )
  })

  const filteredStudents = studentState.list.filter((s) => {
    const q = studentSearch.trim().toLowerCase()
    if (!q) return true
    return (
      (s.username || "").toLowerCase().includes(q) ||
      (s.first_name || "").toLowerCase().includes(q) ||
      (s.last_name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q)
    )
  })

  const handleSelectTeachers = (email) => {
    setTeacherState((prev) => ({
      ...prev,
      selectedEmails: prev.selectedEmails.includes(email)
        ? prev.selectedEmails.filter((i) => i !== email)
        : [...prev.selectedEmails, email],
    }))
  }

  const handleSelectAllTeachers = () => {
    setTeacherState((prev) => ({
      ...prev,
      selectedEmails:
        prev.selectedEmails.length === prev.list.length ? [] : prev.list.map((t) => t.email),
    }))
  }

  const openTeacherDeleteConfirm = useCallback((email) => {
    setTeacherState((prev) => {
      const emails =
        typeof email === "string" && email ? [email] : [...prev.selectedEmails]
      if (!emails.length) return prev
      pendingTeacherDeleteRef.current = emails
      return { ...prev, selectedEmails: emails, showDeleteModal: true }
    })
  }, [])

  const handleSelectStudents = (id) => {
    setStudentState((prev) => {
      const isSelected = prev.selectedIds.some((value) => String(value) === String(id))
      return {
        ...prev,
        selectedIds: isSelected
          ? prev.selectedIds.filter((value) => String(value) !== String(id))
          : [...prev.selectedIds, id],
      }
    })
  }

  const handleSelectAllStudents = () => {
    setStudentState((prev) => ({
      ...prev,
      selectedIds:
        prev.selectedIds.length === prev.list.length ? [] : prev.list.map((s) => s.id),
    }))
  }

  const openStudentDeleteConfirm = useCallback((id) => {
    setStudentState((prev) => {
      const isSingle = id !== undefined && id !== null && id !== ""
      const ids = isSingle ? [id] : [...prev.selectedIds]
      if (!ids.length) return prev
      pendingStudentDeleteRef.current = ids
      return { ...prev, selectedIds: ids, showDeleteModal: true }
    })
  }, [])

  const deleteAllTeacher = useCallback(async () => {
    const emails = pendingTeacherDeleteRef.current
    if (!emails.length) {
      throw new Error("No teachers selected for removal.")
    }
    const token = await fetchCsrfToken()
    const response = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/teachers/`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      body: JSON.stringify({ emails }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `Failed to delete: ${response.status}`)
    }

    await fetchTeachers()
    pendingTeacherDeleteRef.current = []
    setTeacherState((prev) => ({
      ...prev,
      selectedEmails: [],
      showDeleteModal: false,
    }))
    tpToast.success("Teacher(s) removed successfully")
  }, [classId])

  const deleteAllStudent = useCallback(async () => {
    const students = pendingStudentDeleteRef.current
    await classroomApi.removeStudentsFromClassroom(classId, students)
    await fetchStudents()
    pendingStudentDeleteRef.current = []
    setStudentState((prev) => ({
      ...prev,
      selectedIds: [],
      showDeleteModal: false,
    }))
    tpToast.success("Student(s) removed successfully")
  }, [classId, fetchStudents])

  const closeTeacherModal = () =>
    setTeacherState((prev) => ({
      ...prev,
      showDeleteModal: false,
    }))

  const closeStudentModal = () =>
    setStudentState((prev) => ({
      ...prev,
      showDeleteModal: false,
    }))

  const teacherDeleteLabel = useMemo(() => {
    if (teacherState.selectedEmails.length === 1) {
      const teacher = teacherState.list.find((t) => t.email === teacherState.selectedEmails[0])
      return teacher?.username || teacher?.email || ""
    }
    if (teacherState.selectedEmails.length > 1) {
      return `${teacherState.selectedEmails.length} teachers`
    }
    return ""
  }, [teacherState.selectedEmails, teacherState.list])

  const studentDeleteLabel = useMemo(() => {
    if (studentState.selectedIds.length === 1) {
      const student = studentState.list.find((s) => String(s.id) === String(studentState.selectedIds[0]))
      return student?.username || student?.email || ""
    }
    if (studentState.selectedIds.length > 1) {
      return `${studentState.selectedIds.length} students`
    }
    return ""
  }, [studentState.selectedIds, studentState.list])

  const teacherToolbar = (
    <div className="tp-portal-data-table-toolbar-inner">
      <TpPortalSearchField
        value={teacherSearch}
        onChange={setTeacherSearch}
        placeholder="Search teachers by name or email…"
        aria-label="Search teachers"
        id="tp-search-teachers"
      />
      <div className="tp-portal-data-table-toolbar-actions">
        {teacherState.selectedEmails.length > 0 ? (
          <button type="button" className="tp-btn tp-btn-secondary" onClick={() => openTeacherDeleteConfirm()}>
            Remove teachers
          </button>
        ) : null}
        <button type="button" className="tp-btn tp-btn-primary" onClick={() => navigate("/manage-classes/add-teacher")}>
          + Add more teachers
        </button>
      </div>
    </div>
  )

  const studentToolbar = (
    <div className="tp-portal-data-table-toolbar-inner">
      <TpPortalSearchField
        value={studentSearch}
        onChange={setStudentSearch}
        placeholder="Search students by name or email…"
        aria-label="Search students"
        id="tp-search-students"
      />
      <div className="tp-portal-data-table-toolbar-actions">
        {studentState.selectedIds.length > 0 ? (
          <button type="button" className="tp-btn tp-btn-secondary" onClick={() => openStudentDeleteConfirm()}>
            Remove students
          </button>
        ) : null}
        <button type="button" className="tp-btn tp-btn-primary" onClick={() => navigate("/manage-classes/add-student")}>
          + Add more students
        </button>
      </div>
    </div>
  )

  const headerEnd = (
    <button type="button" className="tp-btn tp-btn-secondary tp-mc-modal-header-btn" onClick={goEditClass}>
      <Pencil size={16} strokeWidth={2} aria-hidden />
      Edit class
    </button>
  )

  return (
    <div className="min-vh-100 bg-white d-flex flex-column">
      <div className="cms-tp-scope flex-grow-1 d-flex flex-column min-vh-0">
        <TeacherPortalShell headerTitle="Manage Classes & Students" headerSubtitle={modalTitle}>
          <div className="tp-portal-page tp-class-detail-modal-host">
            <ManageClassModalFrame
              title={modalTitle}
              subtitle={modalSubtitle}
              onClose={closeClassView}
              headerEnd={headerEnd}
              showProgress={false}
              footer={null}
              wide
            >
              <div className="tp-class-detail-modal-body">
                <TeachersTable
                  isLoading={loadingTeachers}
                  toolbar={teacherToolbar}
                  teachers={filteredTeachers}
                  selectedEmails={teacherState.selectedEmails}
                  handleDeleteTeachers={openTeacherDeleteConfirm}
                  handleSelectAllTeachers={handleSelectAllTeachers}
                  handleSelectTeachers={handleSelectTeachers}
                />
                <StudentTable
                  isLoading={loadingStudents}
                  toolbar={studentToolbar}
                  students={filteredStudents}
                  fromTeachers
                  classId={classId}
                  selectedIds={studentState.selectedIds}
                  handleDeleteStudents={openStudentDeleteConfirm}
                  handleSelectAllStudents={handleSelectAllStudents}
                  handleSelectStudents={handleSelectStudents}
                  handleMoveStudent={moveStudent.openMove}
                />
              </div>
            </ManageClassModalFrame>
          </div>
        </TeacherPortalShell>
      </div>

      <MoveStudentModal
        isOpen={moveStudent.isOpen}
        onClose={moveStudent.closeMove}
        student={moveStudent.student}
        sourceClassName={modalTitle}
        targetClassId={moveStudent.targetClassId}
        onTargetClassChange={moveStudent.setTargetClassId}
        eligibleTargets={moveStudent.eligibleTargets}
        loadingTargets={moveStudent.loadingTargets}
        includeGrades={moveStudent.includeGrades}
        canCarryOver={moveStudent.canCarryOver}
        carryOverHelperText={moveStudent.carryOverHelperText}
        onIncludeGradesChange={moveStudent.setIncludeGrades}
        onConfirm={moveStudent.submitMove}
        submitting={moveStudent.submitting}
        error={moveStudent.error}
      />

      <TpDeleteConfirmationModal
        isOpen={teacherState.showDeleteModal}
        onClose={closeTeacherModal}
        onConfirm={deleteAllTeacher}
        title="Remove teachers"
        message="Teacher(s) will be removed from this class."
        itemName={teacherDeleteLabel}
        confirmLabel="Remove"
        cancelLabel="Cancel"
      />

      <TpDeleteConfirmationModal
        isOpen={studentState.showDeleteModal}
        onClose={closeStudentModal}
        onConfirm={deleteAllStudent}
        title="Remove students"
        message="Student(s) will be removed from this class."
        itemName={studentDeleteLabel}
        confirmLabel="Remove"
        cancelLabel="Cancel"
      />
    </div>
  )
}

export default Teachers
