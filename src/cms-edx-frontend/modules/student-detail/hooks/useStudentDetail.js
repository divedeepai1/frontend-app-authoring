import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router"
import * as studentProgressApi from "../services/studentProgressApi"

export function getProgressColor(value) {
  if (value < 50) return "#dc2626"
  if (value <= 70) return "#f97316"
  return "#16a34a"
}

export function useStudentDetail(classData, studentName) {
  const { studentId } = useParams()
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [selectedCourseName, setSelectedCourseName] = useState("")
  const [lessons, setLessons] = useState([])
  const [expandedSections, setExpandedSections] = useState({})
  const [loadingProgress, setLoadingProgress] = useState({ course: 0, average: 0 })
  const [loading, setLoading] = useState(false)
  const [reportPopup, setReportPopup] = useState({ open: false, imageUrl: "", title: "" })

  const courses = classData?.courses || []

  const selectCourse = useCallback((course) => {
    if (!course) return
    setSelectedCourseId(course.id)
    setSelectedCourseName(course.display_name)
  }, [])

  useEffect(() => {
    if (!selectedCourseId && courses.length) {
      selectCourse(courses[0])
    }
  }, [courses, selectedCourseId, selectCourse])

  useEffect(() => {
    if (!selectedCourseId || !studentId) return undefined

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setLessons([])
      setExpandedSections({})
      setLoadingProgress({ course: 0, average: 0 })
      try {
        const integrationData = await studentProgressApi.fetchCourseIntegration(selectedCourseId)
        const result = await studentProgressApi.fetchCourseProgressForUser({
          courseId: selectedCourseId,
          userId: studentId,
          contentData: integrationData,
        })
        if (cancelled) return
        const mapped = studentProgressApi.mapProgressToLessons(result)
        setLoadingProgress({ course: mapped.courseProgress, average: mapped.averageGrade })
        setLessons(mapped.lessons)
        setExpandedSections(mapped.expandedSections)
      } catch {
        if (!cancelled) {
          setLessons([])
          setLoadingProgress({ course: 0, average: 0 })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [selectedCourseId, studentId])

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }))
  }

  return {
    studentId,
    studentName,
    className: classData?.name || "",
    courses,
    selectedCourseId,
    selectedCourseName,
    selectCourse,
    lessons,
    expandedSections,
    toggleSection,
    loadingProgress,
    loading,
    reportPopup,
    openReport: (imageUrl, title) => setReportPopup({ open: true, imageUrl, title }),
    closeReport: () => setReportPopup({ open: false, imageUrl: "", title: "" }),
  }
}
