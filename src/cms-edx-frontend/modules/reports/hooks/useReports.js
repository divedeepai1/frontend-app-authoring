import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import { REPORT_EXPORT_FILENAMES, REPORT_TYPES, REPORT_TYPE_OPTIONS } from "../constants"
import * as reportsApi from "../services/reportsApi"

export function useReports() {
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [students, setStudents] = useState([])
  const [rubrics, setRubrics] = useState([])
  const [reportType, setReportType] = useState(REPORT_TYPES.GRADE)
  const [gradeReport, setGradeReport] = useState({ columns: [], rows: [] })
  const [lessonActivityRows, setLessonActivityRows] = useState([])
  const [overdueRows, setOverdueRows] = useState([])
  const [hasGenerated, setHasGenerated] = useState(false)
  const [loadingMeta, setLoadingMeta] = useState(false)
  const [loadingReport, setLoadingReport] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState("")
  const abortRef = useRef(null)
  const requestIdRef = useRef(0)

  const selectedClassName = useMemo(() => {
    const selected = classes.find((item) => String(item.id) === String(selectedClassId))
    return selected?.name || "class"
  }, [classes, selectedClassId])

  const selectedCourseName = useMemo(() => {
    const selected = courses.find((item) => String(item.id) === String(selectedCourseId))
    return selected?.display_name || "course"
  }, [courses, selectedCourseId])

  const activeCourseCount = useMemo(
    () => reportsApi.countActiveCourses(classes, selectedClassId),
    [classes, selectedClassId]
  )

  const clearReportData = useCallback(() => {
    setGradeReport({ columns: [], rows: [] })
    setLessonActivityRows([])
    setOverdueRows([])
    setHasGenerated(false)
  }, [])

  useEffect(() => {
    reportsApi
      .fetchClassrooms()
      .then((result) => {
        const loaded = Array.isArray(result?.classrooms) ? result.classrooms : []
        setClasses(loaded)
        if (loaded.length) {
          setSelectedClassId(String(loaded[0].id))
          const classCourses = Array.isArray(loaded[0].courses) ? loaded[0].courses : []
          setCourses(classCourses)
          if (classCourses.length) {
            setSelectedCourseId(String(classCourses[0].id))
          }
        }
      })
      .catch(() => {
        setError("Unable to load classes.")
        setClasses([])
      })
  }, [])

  useEffect(() => {
    const selectedClass = classes.find((item) => String(item.id) === String(selectedClassId))
    const nextCourses = Array.isArray(selectedClass?.courses) ? selectedClass.courses : []
    setCourses(nextCourses)
    if (!nextCourses.length) {
      setSelectedCourseId("")
      return
    }
    if (!nextCourses.some((course) => String(course.id) === String(selectedCourseId))) {
      setSelectedCourseId(String(nextCourses[0].id))
    }
  }, [selectedClassId, classes])

  useEffect(() => {
    if (!selectedClassId || !selectedCourseId) {
      setStudents([])
      setRubrics([])
      clearReportData()
      setLoadingMeta(false)
      return undefined
    }

    let cancelled = false
    const loadMeta = async () => {
      setLoadingMeta(true)
      setError("")
      clearReportData()
      try {
        const [nextStudents, nextRubrics] = await Promise.all([
          reportsApi.fetchStudentsForClass(selectedClassId),
          reportsApi.fetchCourseRubrics(selectedCourseId),
        ])
        if (cancelled) return
        setStudents(nextStudents)
        setRubrics(nextRubrics)
        if (!nextStudents.length || !nextRubrics.length) {
          setError("Select a class and course with students and lessons to view a report.")
        }
      } catch {
        if (cancelled) return
        setStudents([])
        setRubrics([])
        setError("Unable to load students or lessons for the selected class and course.")
      } finally {
        if (!cancelled) setLoadingMeta(false)
      }
    }
    loadMeta()
    return () => {
      cancelled = true
      if (abortRef.current) abortRef.current.abort()
    }
  }, [selectedClassId, selectedCourseId, clearReportData])

  useEffect(() => {
    if (loadingMeta) return undefined
    if (!selectedClassId || !selectedCourseId || !students.length || !rubrics.length) {
      return undefined
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    const loadReport = async () => {
      setLoadingReport(true)
      setError("")
      try {
        const result = await reportsApi.fetchReportByType(reportType, {
          courseId: selectedCourseId,
          students,
          rubrics,
          signal: controller.signal,
        })
        if (requestId !== requestIdRef.current) return

        if (reportType === REPORT_TYPES.LESSON_ACTIVITY) {
          setLessonActivityRows(result)
          setGradeReport({ columns: [], rows: [] })
          setOverdueRows([])
        } else if (reportType === REPORT_TYPES.OVERDUE) {
          setOverdueRows(result)
          setGradeReport({ columns: [], rows: [] })
          setLessonActivityRows([])
        } else {
          setGradeReport(result)
          setLessonActivityRows([])
          setOverdueRows([])
        }
        setHasGenerated(true)
      } catch (e) {
        if (e?.name === "AbortError") return
        const msg = "Unable to load report right now."
        setError(msg)
        clearReportData()
        tpToast.error(msg)
      } finally {
        if (requestId === requestIdRef.current) {
          setLoadingReport(false)
        }
      }
    }

    loadReport()
    return () => {
      controller.abort()
    }
  }, [
    loadingMeta,
    selectedClassId,
    selectedCourseId,
    reportType,
    students,
    rubrics,
    clearReportData,
  ])

  const handleClassChange = (classId) => {
    setSelectedClassId(String(classId))
  }

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(String(courseId))
  }

  const handleReportTypeChange = (nextType) => {
    setReportType(nextType)
  }

  const handleExport = async () => {
    if (!selectedCourseId || !students.length || !rubrics.length) return
    setExporting(true)
    try {
      const response = await reportsApi.exportReportCsvByType(reportType, {
        courseId: selectedCourseId,
        students,
        rubrics,
      })
      await reportsApi.downloadBlobResponse(
        response,
        REPORT_EXPORT_FILENAMES[reportType] || "report.csv"
      )
      tpToast.success("Report exported as CSV")
    } catch {
      tpToast.error("Unable to export report right now.")
    } finally {
      setExporting(false)
    }
  }

  const statsCards = useMemo(
    () => [
      {
        id: "total-classes",
        title: "Total Classes",
        value: String(classes.length),
        icon: "classes",
        color: "#27aae1",
        bgColor: "#E8F4F8",
      },
      {
        id: "total-students",
        title: "Students in Class",
        value: loadingMeta ? "…" : String(students.length),
        icon: "students",
        color: "#F97316",
        bgColor: "#FFF4ED",
      },
      {
        id: "active-courses",
        title: "Courses in Class",
        value: String(courses.length || activeCourseCount),
        icon: "courses",
        color: "#27576B",
        bgColor: "#EBF0F2",
      },
      {
        id: "lessons",
        title: "Lessons / Rubrics",
        value: loadingMeta ? "…" : String(rubrics.length),
        icon: "trend",
        color: "#10B981",
        bgColor: "#ECFDF5",
      },
    ],
    [classes.length, students.length, courses.length, activeCourseCount, rubrics.length, loadingMeta]
  )

  const currentReportLabel =
    REPORT_TYPE_OPTIONS.find((option) => option.id === reportType)?.label || "Report"

  return {
    classes,
    courses,
    selectedClassId,
    selectedCourseId,
    selectedClassName,
    selectedCourseName,
    reportType,
    reportTypeOptions: REPORT_TYPE_OPTIONS,
    gradeReport,
    lessonActivityRows,
    overdueRows,
    hasGenerated,
    loading: loadingReport || loadingMeta,
    loadingReport: loadingReport || loadingMeta,
    loadingMeta,
    exporting,
    error,
    statsCards,
    currentReportLabel,
    handleClassChange,
    handleCourseChange,
    handleReportTypeChange,
    handleExport,
  }
}
