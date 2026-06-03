import { useCallback, useEffect, useMemo, useState } from "react"
import * as curriculumApi from "../services/curriculumApi"

function buildExpandedChapters(chapters) {
  const next = {}
  ;(chapters || []).forEach((chapter) => {
    next[chapter.id] = true
  })
  return next
}

function buildExpandedLessons(lessons) {
  const next = {}
  ;(lessons || []).forEach((lesson) => {
    next[lesson.id] = lesson.is_expanded || false
  })
  return next
}

function groupLessonsByChapter(lessons) {
  const byChapter = {}
  ;(lessons || []).forEach((ls) => {
    const key = String(ls.chapter_id ?? ls.chapterId ?? ls.parent_chapter_id ?? "")
    if (!key) return
    if (!byChapter[key]) byChapter[key] = []
    byChapter[key].push(ls)
  })
  return byChapter
}

function groupVerticalsByLesson(verticals) {
  const byLesson = {}
  ;(verticals || []).forEach((v) => {
    const key = String(
      v.lesson_id ?? v.lessonId ?? v.parent_lesson_id ?? v.subsection_lesson_id ?? ""
    )
    if (!key) return
    if (!byLesson[key]) byLesson[key] = []
    byLesson[key].push(v)
  })
  return byLesson
}

export function useManageCourse() {
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [courseTitle, setCourseTitle] = useState("")
  const [chapters, setChapters] = useState([])
  const [lessons, setLessons] = useState([])
  const [verticals, setVerticals] = useState([])
  const [expandedChapters, setExpandedChapters] = useState({})
  const [expandedLessons, setExpandedLessons] = useState({})
  const [classStudents, setClassStudents] = useState([])
  const [isResourcesDialogOpen, setIsResourcesDialogOpen] = useState(false)
  const [scheduleContext, setScheduleContext] = useState(null)
  const [timerContext, setTimerContext] = useState(null)
  const [attemptContext, setAttemptContext] = useState(null)
  const [previewContext, setPreviewContext] = useState(null)

  const loadClasses = useCallback(async () => {
    try {
      const result = await curriculumApi.fetchClassrooms()
      const cls = result?.classrooms || []
      setClasses(cls)
      if (cls.length) {
        setSelectedClassId(String(cls[0].id))
        const firstCourses = cls[0]?.courses || []
        setCourses(firstCourses)
        if (firstCourses.length) {
          setSelectedCourseId(String(firstCourses[0].id))
          setCourseTitle(firstCourses[0].display_name || "")
        }
      }
    } catch {
      setClasses([])
      setCourses([])
    }
  }, [])

  const loadCourseIntegration = useCallback(async (courseKey) => {
    if (!courseKey) return
    try {
      const data = await curriculumApi.fetchCourseIntegration(courseKey)
      setCourseTitle(data?.course?.name || "")
      setChapters(data?.chapters || [])
      setLessons(data?.lessons || [])
      setVerticals(data?.verticals || [])
      setExpandedChapters(buildExpandedChapters(data?.chapters))
      setExpandedLessons(buildExpandedLessons(data?.lessons))
    } catch {
      setChapters([])
      setLessons([])
      setVerticals([])
    }
  }, [])

  const loadClassStudents = useCallback(async (classId) => {
    if (!classId) {
      setClassStudents([])
      return
    }
    try {
      const result = await curriculumApi.fetchStudentsForClass(classId)
      setClassStudents(result?.students || [])
    } catch {
      setClassStudents([])
    }
  }, [])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  useEffect(() => {
    if (selectedCourseId) loadCourseIntegration(selectedCourseId)
  }, [selectedCourseId, loadCourseIntegration])

  useEffect(() => {
    loadClassStudents(selectedClassId)
  }, [selectedClassId, loadClassStudents])

  useEffect(() => {
    const found = classes.find((c) => String(c.id) === String(selectedClassId))
    const nextCourses = found?.courses || []
    setCourses(nextCourses)
    if (nextCourses.length) {
      setSelectedCourseId(String(nextCourses[0].id))
      setCourseTitle(nextCourses[0].display_name || "")
    } else {
      setSelectedCourseId("")
      setCourseTitle("")
    }
  }, [selectedClassId, classes])

  const lessonsByChapter = useMemo(() => groupLessonsByChapter(lessons), [lessons])
  const verticalsByLesson = useMemo(() => groupVerticalsByLesson(verticals), [verticals])

  const toggleChapter = useCallback((chapterId) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }))
  }, [])

  const toggleLessonUiExpanded = useCallback((lessonId) => {
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }))
  }, [])

  const toggleLessonExpanded = useCallback(
    async (lessonId) => {
      const currentState = expandedLessons[lessonId] || false
      const newState = !currentState
      setExpandedLessons((prev) => ({ ...prev, [lessonId]: newState }))
      if (!selectedCourseId) return
      try {
        await curriculumApi.updateLessonExpanded(lessonId, selectedCourseId, newState)
      } catch {
        setExpandedLessons((prev) => ({ ...prev, [lessonId]: currentState }))
      }
    },
    [expandedLessons, selectedCourseId]
  )

  const openSchedule = useCallback((lesson, vertical) => {
    if (!lesson || !vertical) return
    setScheduleContext({
      lessonTitle: lesson.title,
      verticalTitle: vertical.title,
      rubricId: vertical?.id || "",
    })
  }, [])

  const openTimer = useCallback((lesson, vertical) => {
    if (!lesson || !vertical) return
    setTimerContext({
      lessonTitle: lesson.title,
      verticalTitle: vertical.title,
      rubricId: vertical?.id || "",
    })
  }, [])

  const openAttempts = useCallback((lesson, vertical) => {
    if (!lesson || !vertical) return
    setAttemptContext({
      lessonTitle: lesson.title,
      verticalTitle: vertical.title,
      rubricId: vertical?.id || "",
    })
  }, [])

  const openPreview = useCallback((lesson, vertical) => {
    if (!lesson || !vertical) return
    setPreviewContext({
      lessonTitle: lesson.title,
      verticalTitle: vertical.title,
      rubricId: vertical?.id || "",
    })
  }, [])

  const modalTitle = (ctx) =>
    ctx ? `${ctx.verticalTitle || ""} • ${ctx.lessonTitle || ""}` : ""

  return {
    classes,
    courses,
    selectedClassId,
    setSelectedClassId,
    selectedCourseId,
    setSelectedCourseId,
    courseTitle,
    chapters,
    lessonsByChapter,
    verticalsByLesson,
    expandedChapters,
    expandedLessons,
    classStudents,
    isResourcesDialogOpen,
    setIsResourcesDialogOpen,
    scheduleContext,
    timerContext,
    attemptContext,
    previewContext,
    setScheduleContext,
    setTimerContext,
    setAttemptContext,
    setPreviewContext,
    toggleChapter,
    toggleLessonUiExpanded,
    toggleLessonExpanded,
    openSchedule,
    openTimer,
    openAttempts,
    openPreview,
    modalTitle,
  }
}
