import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import * as gradebookApi from "../services/gradebookApi"

export function useGradebook() {
  const [isCourseWeightModalOpen, setIsCourseWeightModalOpen] = useState(false)
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

  const selectedClassName = useMemo(() => {
    const selectedClass = classes.find((item) => String(item.id) === String(selectedClassId))
    return selectedClass?.name || "selected class"
  }, [classes, selectedClassId])

  const selectedCourseName = useMemo(() => {
    const selectedCourseItem = courses.find((course) => String(course.id) === String(selectedCourse))
    return selectedCourseItem?.display_name || "selected course"
  }, [courses, selectedCourse])

  const loadGradebook = useCallback(
    async (classId, courseId, studentsArg, lessonsArg, force = false) => {
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
        const data = await gradebookApi.postViewGradebook({
          courseId,
          students: safeStudents,
          rubrics: safeRubrics,
          signal: controller.signal,
        })
        if (requestId !== latestGradebookRequestIdRef.current) {
          return
        }
        const normalized = gradebookApi.normalizeGradebookResponse(data, safeStudents, safeRubrics)
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
    },
    []
  )

  useEffect(() => {
    gradebookApi
      .fetchClassrooms()
      .then((result) => {
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
      })
      .catch(() => {
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
      return undefined
    }
    lastGradebookRequestKeyRef.current = ""
    const loadForSelection = async () => {
      try {
        const [students, lessons] = await Promise.all([
          gradebookApi.fetchStudentsForClass(selectedClassId),
          gradebookApi.fetchCourseRubrics(selectedCourse),
        ])
        setClassStudents(students)
        setCourseRubrics(lessons)
        await loadGradebook(selectedClassId, selectedCourse, students, lessons, false)
      } catch {
        setError("Unable to load gradebook for selected class and course.")
      }
    }
    loadForSelection()
    return () => {
      if (gradebookAbortRef.current) {
        gradebookAbortRef.current.abort()
      }
    }
  }, [selectedClassId, selectedCourse, loadGradebook])

  const handleExport = async () => {
    if (!selectedCourse || !studentIds.length) return
    setExporting(true)
    setError("")
    try {
      const response = await gradebookApi.postExportGradebookCsv({
        courseId: selectedCourse,
        students: classStudents,
        rubrics: courseRubrics,
      })
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
      tpToast.success("Gradebook exported as CSV successfully")
    } catch {
      const msg = "Unable to export gradebook right now."
      setError(msg)
      tpToast.error(msg)
    } finally {
      setExporting(false)
    }
  }

  const handleOverrideSubmit = async ({ courseId, rubricId, userId, overrideScore, reason }) => {
    setSavingOverride(true)
    setError("")
    setSuccess("")
    try {
      await gradebookApi.postOverrideGradebook({
        courseId,
        rubricId,
        userId,
        overrideScore,
        reason,
      })
      setOverrideContext(null)
      setSuccess("Grade updated successfully.")
      tpToast.success("Grade updated successfully")
      await loadGradebook(selectedClassId, selectedCourse, classStudents, courseRubrics, true)
    } catch {
      const msg = "Unable to update grade right now."
      setError(msg)
      tpToast.error(msg)
    } finally {
      setSavingOverride(false)
    }
  }

  const handleClassOverrideWeightSave = async ({
    courseId,
    lessonWeight,
    quizWeight,
    testWeight,
  }) => {
    const normalizedStudentIds = classStudents
      .map((student) => Number(student?.id))
      .filter((id) => Number.isInteger(id))
    setError("")
    setSuccess("")
    await gradebookApi.postSaveClassOverrideWeight({
      courseId,
      studentIds: normalizedStudentIds,
      lessonWeight,
      quizWeight,
      testWeight,
    })
  }

  const handleClassOverrideWeightFetch = async ({ courseId }) => {
    const normalizedStudentIds = classStudents
      .map((student) => Number(student?.id))
      .filter((id) => Number.isInteger(id))
    const data = await gradebookApi.postGetClassOverrideWeight({
      courseId,
      studentIds: normalizedStudentIds,
    })
    return gradebookApi.parseClassOverrideWeightResponse(data)
  }

  return {
    classes,
    courses,
    selectedClassId,
    setSelectedClassId,
    selectedCourse,
    setSelectedCourse,
    courseRubrics,
    filteredStudents,
    gradebookRows,
    editedLessonIds,
    loading,
    exporting,
    savingOverride,
    error,
    success,
    setError,
    setSuccess,
    overrideContext,
    setOverrideContext,
    studentSearch,
    setStudentSearch,
    studentIds,
    selectedClassName,
    selectedCourseName,
    isCourseWeightModalOpen,
    setIsCourseWeightModalOpen,
    handleExport,
    handleOverrideSubmit,
    handleClassOverrideWeightSave,
    handleClassOverrideWeightFetch,
  }
}
