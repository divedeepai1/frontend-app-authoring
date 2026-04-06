import { useEffect, useMemo, useRef, useState } from "react"
import { Container } from "react-bootstrap"
import { getConfig } from "@edx/frontend-platform"
import HeaderTop from "../../header"
import { Header } from "../components/header"
import { ManagementSection } from "../components/management-section"
import { fetchCsrfToken } from "../../cms-csrftoken"
import { base_url } from "../../compugrade-constants"
import GradebookTable from "../components/courses/gradebook/GradebookTable"
import GradeOverrideModal from "../components/courses/gradebook/GradeOverrideModal"

const SELECT_STYLE = {
  boxShadow: "none",
  outline: "none",
  borderColor: "#6B7280",
  color: "#111827",
  height: 36,
  padding: "0 40px 0 8px",
  lineHeight: 1.5,
  border: "1px solid #6B7280",
  borderRadius: "4px",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  backgroundSize: "14px",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
}

const toCellMap = (grades) => {
  if (!grades) return {}
  if (Array.isArray(grades)) {
    return grades.reduce((acc, grade) => {
      const lessonId = grade?.rubric_id ?? grade?.lesson_id ?? grade?.id
      if (lessonId !== undefined && lessonId !== null) {
        acc[String(lessonId)] = grade
      }
      return acc
    }, {})
  }
  if (typeof grades === "object") return grades
  return {}
}

const normalizeGradebookResponse = (payload, fallbackStudents, fallbackLessons) => {
  const body = payload?.data && typeof payload.data === "object" ? payload.data : payload || {}
  const lessonList = Array.isArray(body.lessons)
    ? body.lessons.map((lesson, index) => {
        const lessonId = lesson.id ?? lesson.rubric_id ?? lesson.lesson_id
        return {
          id: lessonId,
          title: lesson.title ?? lesson.name ?? `Lesson ${index + 1}`,
        }
      })
    : fallbackLessons
  const fallbackById = new Map(
    (fallbackStudents || []).map((student) => [String(student.id), student])
  )
  const studentsFromApi = Array.isArray(body.students)
    ? body.students.map((student) => {
        const studentId = student.id ?? student.user_id ?? student.student_id
        const fallback = fallbackById.get(String(studentId))
        return {
          id: studentId,
          name:
            student.name ??
            student.full_name ??
            student.email ??
            fallback?.name ??
            `Student ${studentId ?? ""}`,
          email: student.email ?? fallback?.email ?? "",
        }
      })
    : fallbackStudents
  const rows = Array.isArray(body.rows) ? body.rows : Array.isArray(body.gradebook) ? body.gradebook : []
  const gradesByStudent = {}
  rows.forEach((row) => {
    const studentId = row?.student_id ?? row?.user_id ?? row?.id
    if (studentId !== undefined && studentId !== null) {
      gradesByStudent[String(studentId)] = toCellMap(row?.grades || row?.lessons || row?.grade_map)
    }
  })
  if (Array.isArray(body.students)) {
    body.students.forEach((student) => {
      const studentId = student?.id ?? student?.user_id ?? student?.student_id
      if (studentId !== undefined && studentId !== null && !gradesByStudent[String(studentId)]) {
        gradesByStudent[String(studentId)] = toCellMap(student?.grades || student?.lessons || student?.grade_map)
      }
    })
  }
  if (body.grade_map && typeof body.grade_map === "object") {
    Object.keys(body.grade_map).forEach((studentId) => {
      gradesByStudent[String(studentId)] = toCellMap(body.grade_map[studentId])
    })
  }
  const editedLessonIds = new Set(
    Array.isArray(body.edited_lesson_ids)
      ? body.edited_lesson_ids.map((value) => String(value))
      : Array.isArray(body.edited_lessons)
      ? body.edited_lessons.map((item) => String(item?.id ?? item?.rubric_id ?? item))
      : []
  )
  return {
    lessons: lessonList.filter((lesson) => lesson.id !== undefined && lesson.id !== null),
    students: studentsFromApi.filter((student) => student.id !== undefined && student.id !== null),
    gradesByStudent,
    editedLessonIds,
  }
}

const Gradebook = () => {
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [classStudents, setClassStudents] = useState([])
  const [courseRubrics, setCourseRubrics] = useState([])
  const [gradebookRows, setGradebookRows] = useState({})
  const [editedLessonIds, setEditedLessonIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [savingOverride, setSavingOverride] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [overrideContext, setOverrideContext] = useState(null)
  const [studentSearch, setStudentSearch] = useState("")
  const lastGradebookRequestKeyRef = useRef("")
  const gradebookAbortRef = useRef(null)
  const latestGradebookRequestIdRef = useRef(0)

  const studentIds = useMemo(() => classStudents.map((student) => student.id), [classStudents])
  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase()
    if (!query) return classStudents
    return classStudents.filter((student) => {
      const name = String(student.name || "").toLowerCase()
      const email = String(student.email || "").toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }, [classStudents, studentSearch])

  const fetchClasses = async () => {
    const token = await fetchCsrfToken()
    const response = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || "Failed to load classes.")
    }
    const result = await response.json()
    const loadedClasses = Array.isArray(result?.classrooms) ? result.classrooms : []
    setClasses(loadedClasses)
    if (loadedClasses.length) {
      const classId = loadedClasses[0].id
      setSelectedClassId(classId)
      const classCourses = Array.isArray(loadedClasses[0].courses) ? loadedClasses[0].courses : []
      setCourses(classCourses)
      if (classCourses.length) {
        setSelectedCourse(classCourses[0].id)
      }
    }
  }

  const fetchStudentsForClass = async (classId) => {
    if (!classId) {
      setClassStudents([])
      return []
    }
    const token = await fetchCsrfToken()
    const response = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/students-list/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || "Failed to load students.")
    }
    const result = await response.json()
    const students = Array.isArray(result?.students) ? result.students : []
    const normalizedStudents = students.map((student) => ({
      id: student.id,
      name: student.name || student.full_name || student.email || `Student ${student.id}`,
      email: student.email || "",
    }))
    setClassStudents(normalizedStudents)
    return normalizedStudents
  }

  const fetchCourseIntegration = async (courseId) => {
    if (!courseId) {
      setCourseRubrics([])
      return []
    }
    const response = await fetch(
      `${getConfig().STUDIO_BASE_URL}/myplugin/course-integration/?course_key=${encodeURIComponent(courseId)}`,
      {
        method: "GET",
        credentials: "include",
      }
    )
    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || "Failed to load lessons.")
    }
    const data = await response.json()
    const rubrics = Array.isArray(data?.verticals)
      ? data.verticals.map((vertical, index) => ({
          id: vertical.id,
          title: vertical.title || `Subsection ${index + 1}`,
        }))
      : []
    setCourseRubrics(rubrics)
    return rubrics
  }

  const fetchGradebook = async (classId, courseId, studentsArg, lessonsArg, force = false) => {
    const safeStudents = Array.isArray(studentsArg) ? studentsArg : []
    const safeRubrics = Array.isArray(lessonsArg) ? lessonsArg : []
    if (!courseId || !classId || !safeStudents.length || !safeRubrics.length) {
      setGradebookRows({})
      setEditedLessonIds(new Set())
      return
    }
    const requestKey = [
      String(classId),
      String(courseId),
      safeStudents.map((student) => String(student.id)).join(","),
      safeRubrics.map((lesson) => String(lesson.id)).join(","),
    ].join("|")
    if (!force && lastGradebookRequestKeyRef.current === requestKey) {
      return
    }
    lastGradebookRequestKeyRef.current = requestKey

    if (gradebookAbortRef.current) {
      gradebookAbortRef.current.abort()
    }
    const controller = new AbortController()
    gradebookAbortRef.current = controller
    const requestId = latestGradebookRequestIdRef.current + 1
    latestGradebookRequestIdRef.current = requestId

    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const response = await fetch(`${base_url}/api/grading/view_gradebook`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: courseId,
          users: safeStudents.map((student) => ({
            user_id: student.id,
            email: student.email || "",
          })),
          rubrics: safeRubrics.map((lesson) => ({
            rubric_id: lesson.id,
            title: lesson.title || "",
          })),
        }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Failed to load gradebook.")
      }
      const data = await response.json()
      if (requestId !== latestGradebookRequestIdRef.current) {
        return
      }
      const normalized = normalizeGradebookResponse(data, safeStudents, safeRubrics)
      setCourseRubrics(normalized.lessons.length ? normalized.lessons : safeRubrics)
      setClassStudents(normalized.students.length ? normalized.students : safeStudents)
      setGradebookRows(normalized.gradesByStudent)
      setEditedLessonIds(normalized.editedLessonIds)
    } catch (e) {
      if (e?.name === "AbortError") {
        return
      }
      setError("Unable to load gradebook right now.")
    } finally {
      if (requestId === latestGradebookRequestIdRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchClasses().catch(() => {
      setError("Unable to load class and course data.")
    })
  }, [])

  useEffect(() => {
    const selectedClass = classes.find((item) => String(item.id) === String(selectedClassId))
    const nextCourses = Array.isArray(selectedClass?.courses) ? selectedClass.courses : []
    setCourses(nextCourses)
    if (!nextCourses.length) {
      setSelectedCourse("")
      return
    }
    if (!nextCourses.some((course) => String(course.id) === String(selectedCourse))) {
      setSelectedCourse(nextCourses[0].id)
    }
  }, [selectedClassId, classes])

  useEffect(() => {
    if (!selectedClassId || !selectedCourse) {
      setClassStudents([])
      setCourseRubrics([])
      if (gradebookAbortRef.current) {
        gradebookAbortRef.current.abort()
      }
      lastGradebookRequestKeyRef.current = ""
      return
    }
    lastGradebookRequestKeyRef.current = ""
    const loadForSelection = async () => {
      try {
        const [students, lessons] = await Promise.all([
          fetchStudentsForClass(selectedClassId),
          fetchCourseIntegration(selectedCourse),
        ])
        await fetchGradebook(selectedClassId, selectedCourse, students, lessons, false)
      } catch (e) {
        setError("Unable to load gradebook for selected class and course.")
      }
    }
    loadForSelection()
  }, [selectedClassId, selectedCourse])

  useEffect(() => {
    return () => {
      if (gradebookAbortRef.current) {
        gradebookAbortRef.current.abort()
      }
    }
  }, [])

  const handleExport = async () => {
    if (!selectedCourse || !studentIds.length) return
    setExporting(true)
    setError("")
    try {
      const response = await fetch(`${base_url}/api/grading/export_gradebook_csv`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: selectedCourse,
          users: classStudents.map((student) => ({
            user_id: student.id,
            email: student.email || "",
          })),
          rubrics: courseRubrics.map((rubric) => ({
            rubric_id: rubric.id,
            title: rubric.title || "",
          })),
        }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Failed to export gradebook.")
      }
      const blob = await response.blob()
      const disposition = response.headers.get("content-disposition") || ""
      const match = disposition.match(/filename="?([^"]+)"?/)
      const filename = match?.[1] || "gradebook.csv"
      const link = document.createElement("a")
      const objectUrl = URL.createObjectURL(blob)
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (e) {
      setError("Unable to export gradebook right now.")
    } finally {
      setExporting(false)
    }
  }

  const handleOverrideSubmit = async ({ courseId, rubricId, userId, overrideScore, reason }) => {
    setSavingOverride(true)
    setError("")
    setSuccess("")
    try {
      const response = await fetch(`${base_url}/api/grading/override_gradebook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: courseId,
          rubric_id: rubricId,
          user_id: userId,
          override_score: overrideScore,
          reason,
        }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Failed to update grade.")
      }
      setOverrideContext(null)
      setSuccess("Grade updated successfully.")
      await fetchGradebook(selectedClassId, selectedCourse, classStudents, courseRubrics, true)
    } catch (e) {
      setError("Unable to update grade right now.")
    } finally {
      setSavingOverride(false)
    }
  }

  return (
    <div>
      <HeaderTop isHiddenMainMenu />
      <div className="min-vh-100 bg-white">
        <Header
          heading="Manage Courses & Curriculum"
          bg="linear-gradient(90deg, #255A71 0%, #0096D7 100%)"
          color="white"
          outline="outline-white-button"
        />
        <ManagementSection />
        <section className="px-5">
          <Container>
            <div>
              <style>{`
                select:focus,
                select:active {
                  box-shadow: none !important;
                  outline: none !important;
                }
              `}</style>
              <div className="col-md-12 d-flex py-4">
                <div className="col-md-4">
                  <div className="d-flex align-items-center">
                    <label htmlFor="classSelect" className="mr-2" style={{ fontWeight: "600" }}>
                      Select Class :
                    </label>
                    <select
                      id="classSelect"
                      style={SELECT_STYLE}
                      value={selectedClassId}
                      onChange={(event) => setSelectedClassId(event.target.value)}
                    >
                      {Array.isArray(classes) && classes.length ? (
                        classes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))
                      ) : (
                        <option value="">No relevant class</option>
                      )}
                    </select>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="d-flex align-items-center">
                    <label htmlFor="courseSelect" className="mr-2" style={{ fontWeight: "600" }}>
                      Select Course :
                    </label>
                    <select
                      id="courseSelect"
                      style={SELECT_STYLE}
                      value={selectedCourse}
                      onChange={(event) => setSelectedCourse(event.target.value)}
                    >
                      {Array.isArray(courses) && courses.length ? (
                        courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.display_name}
                          </option>
                        ))
                      ) : (
                        <option value="">No courses</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="primary-text m-0">Class Gradebook</h2>
                    <div className="d-flex align-items-center" style={{ gap: 10 }}>
                      <input
                        type="text"
                        className="form-control"
                        style={{ width: 260, minWidth: 220 }}
                        placeholder="Search student here"
                        value={studentSearch}
                        onChange={(event) => setStudentSearch(event.target.value)}
                      />
                      <button
                        className="primary-button px-4 py-2"
                        onClick={handleExport}
                        disabled={exporting || loading || !selectedCourse || !studentIds.length}
                      >
                        {exporting ? "Exporting..." : "Export CSV"}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="alert alert-danger py-2 px-3" style={{ fontSize: 12 }}>
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="alert alert-success py-2 px-3" style={{ fontSize: 12 }}>
                      {success}
                    </div>
                  )}
                  {loading ? (
                    <div className="py-4 text-center" style={{ color: "#6B7280" }}>
                      Loading gradebook...
                    </div>
                  ) : (
                    <GradebookTable
                      lessons={courseRubrics}
                      students={filteredStudents}
                      gradesByStudent={gradebookRows}
                      editedLessonIds={editedLessonIds}
                      onEditCell={(student, lesson, value) => {
                        setOverrideContext({ student, lesson, value })
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </Container>
        </section>
      </div>

      <GradeOverrideModal
        isOpen={!!overrideContext}
        onClose={() => setOverrideContext(null)}
        courseId={selectedCourse}
        student={overrideContext?.student}
        lesson={overrideContext?.lesson}
        initialValue={overrideContext?.value}
        onSubmit={handleOverrideSubmit}
        saving={savingOverride}
      />
    </div>
  )
}

export default Gradebook
