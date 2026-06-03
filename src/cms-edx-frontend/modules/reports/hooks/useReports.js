import { useCallback, useEffect, useMemo, useState } from "react"
import * as reportsApi from "../services/reportsApi"

const ALL_CLASSES = "all"

export function useReports() {
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState(ALL_CLASSES)
  const [reportDate, setReportDate] = useState("")
  const [studentStats, setStudentStats] = useState({
    totalStudents: 0,
    studentsJoinedLastWeek: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const activeCourseCount = useMemo(
    () => reportsApi.countActiveCourses(classes, selectedClassId === ALL_CLASSES ? "" : selectedClassId),
    [classes, selectedClassId]
  )

  const loadStudentStats = useCallback(async (classId, classrooms) => {
    setLoading(true)
    setError("")
    try {
      if (classId === ALL_CLASSES) {
        const aggregated = await reportsApi.fetchAggregatedStudentStats(classrooms)
        setStudentStats(aggregated)
      } else if (classId) {
        const stats = await reportsApi.fetchStudentStats(classId)
        setStudentStats(stats)
      } else {
        setStudentStats({ totalStudents: 0, studentsJoinedLastWeek: 0 })
      }
    } catch {
      setError("Unable to load report statistics.")
      setStudentStats({ totalStudents: 0, studentsJoinedLastWeek: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const now = new Date()
    setReportDate(now.toISOString().split("T")[0])
  }, [])

  useEffect(() => {
    reportsApi
      .fetchClassrooms()
      .then((result) => {
        const loaded = Array.isArray(result?.classrooms) ? result.classrooms : []
        setClasses(loaded)
        if (loaded.length && selectedClassId !== ALL_CLASSES && !loaded.some((c) => String(c.id) === String(selectedClassId))) {
          setSelectedClassId(String(loaded[0].id))
        }
      })
      .catch(() => {
        setError("Unable to load classes.")
        setClasses([])
      })
  }, [])

  useEffect(() => {
    if (!classes.length) {
      setStudentStats({ totalStudents: 0, studentsJoinedLastWeek: 0 })
      return
    }
    loadStudentStats(selectedClassId, classes)
  }, [selectedClassId, classes, loadStudentStats])

  const handleGenerateReport = () => {
    loadStudentStats(selectedClassId, classes)
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
        title: "Total Students",
        value: loading ? "…" : String(studentStats.totalStudents),
        icon: "students",
        color: "#F97316",
        bgColor: "#FFF4ED",
      },
      {
        id: "active-courses",
        title: "Active Courses",
        value: String(activeCourseCount),
        icon: "courses",
        color: "#27576B",
        bgColor: "#EBF0F2",
      },
      {
        id: "new-students",
        title: "New Students",
        value: loading ? "…" : String(studentStats.studentsJoinedLastWeek),
        subtitle: "Joined in last week",
        icon: "trend",
        color: "#10B981",
        bgColor: "#ECFDF5",
      },
    ],
    [classes.length, studentStats, activeCourseCount, loading]
  )

  return {
    classes,
    selectedClassId,
    setSelectedClassId,
    reportDate,
    setReportDate,
    statsCards,
    loading,
    error,
    handleGenerateReport,
    allClassesValue: ALL_CLASSES,
  }
}
