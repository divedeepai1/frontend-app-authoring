import { useEffect, useMemo, useState } from "react"
import { base_url } from "../../compugrade-constants"
import { clampWeight, parseWeight, sanitizeWeightInput } from "./weightSettingsUtils"

export function useCourseWeightSettings({ isOpen, courseId, onFetch, onSave, onSaveSuccess, onClose }) {
  const [assessmentWeight, setAssessmentWeight] = useState("")
  const [lessonWeight, setLessonWeight] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasTouched, setHasTouched] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchWeightSettings = async () => {
      if (!isOpen || !courseId) {
        return
      }

      setIsLoading(true)
      setHasTouched(false)
      setError("")
      try {
        let fetchedAssessment = null
        let fetchedLesson = null

        if (onFetch) {
          const fetchedData = await onFetch({ courseId })
          fetchedAssessment = parseWeight(fetchedData?.assessmentWeight)
          fetchedLesson = parseWeight(fetchedData?.lessonWeight)
        } else {
          const params = new URLSearchParams({ course_id: courseId })
          const response = await fetch(
            `${base_url}/api/grading/get_weight_settings?${params.toString()}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          )

          if (!response.ok) {
            throw new Error("Failed to fetch weight settings")
          }

          const data = await response.json()
          fetchedAssessment = parseWeight(data?.assessment_weight)
          fetchedLesson = parseWeight(data?.lesson_weight)
        }

        const normalizedAssessment = clampWeight(fetchedAssessment ?? 0)
        const normalizedLesson =
          fetchedLesson !== null ? clampWeight(fetchedLesson) : 100 - normalizedAssessment

        setAssessmentWeight(normalizedAssessment.toString())
        setLessonWeight(normalizedLesson.toString())
      } catch {
        setAssessmentWeight("50")
        setLessonWeight("50")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeightSettings()
  }, [isOpen, courseId, onFetch])

  const parsedAssessment = parseWeight(assessmentWeight)
  const parsedLesson = parseWeight(lessonWeight)

  const isAssessmentValid =
    parsedAssessment !== null && parsedAssessment >= 0 && parsedAssessment <= 100
  const isLessonValid = parsedLesson !== null && parsedLesson >= 0 && parsedLesson <= 100
  const canSave = isAssessmentValid && isLessonValid && !isLoading && !isSaving

  const showAssessmentError = hasTouched && !isAssessmentValid
  const showLessonError = hasTouched && !isLessonValid

  const isDirty = useMemo(() => {
    if (parsedAssessment === null || parsedLesson === null) {
      return false
    }
    return parsedAssessment + parsedLesson === 100
  }, [parsedAssessment, parsedLesson])

  const handleAssessmentChange = (event) => {
    const nextValue = sanitizeWeightInput(event.target.value)
    setAssessmentWeight(nextValue)

    const parsed = parseWeight(nextValue)
    if (parsed === null) {
      setLessonWeight("")
      return
    }

    const clamped = clampWeight(parsed)
    setLessonWeight(String(100 - clamped))
  }

  const handleLessonChange = (event) => {
    const nextValue = sanitizeWeightInput(event.target.value)
    setLessonWeight(nextValue)

    const parsed = parseWeight(nextValue)
    if (parsed === null) {
      setAssessmentWeight("")
      return
    }

    const clamped = clampWeight(parsed)
    setAssessmentWeight(String(100 - clamped))
  }

  const handleSave = async () => {
    setHasTouched(true)
    if (!canSave || !isDirty || !courseId) {
      return
    }

    setIsSaving(true)
    setError("")
    try {
      if (onSave) {
        await onSave({
          courseId,
          assessmentWeight: parsedAssessment,
        })
      } else {
        const response = await fetch(`${base_url}/api/grading/save_course_default_weight_settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            course_id: courseId,
            assessment_weight: parsedAssessment,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to save course weight settings")
        }
      }

      onSaveSuccess?.()
      onClose?.()
    } catch {
      setError("Unable to save weight settings. Please try again.")
      setHasTouched(true)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    assessmentWeight,
    lessonWeight,
    isLoading,
    isSaving,
    canSave,
    isDirty,
    showAssessmentError,
    showLessonError,
    error,
    handleAssessmentChange,
    handleLessonChange,
    handleSave,
  }
}
