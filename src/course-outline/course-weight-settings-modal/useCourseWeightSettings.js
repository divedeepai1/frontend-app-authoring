import { useEffect, useMemo, useState } from "react"
import { base_url } from "../../compugrade-constants"
import { clampWeight, parseWeight, sanitizeWeightInput } from "./weightSettingsUtils"

const DEFAULTS = {
  lesson: "50",
  quiz: "25",
  test: "25",
}

function readWeights(source) {
  const lesson = parseWeight(
    source?.lessonWeight ?? source?.lesson_weight ?? source?.["lesson-weight"]
  )
  const quiz = parseWeight(source?.quizWeight ?? source?.quiz_weight)
  const test = parseWeight(source?.testWeight ?? source?.test_weight)

  // Legacy fallback: assessment_weight → quiz_weight
  const legacyAssessment = parseWeight(source?.assessmentWeight ?? source?.assessment_weight)

  const normalizedQuiz = quiz ?? (legacyAssessment !== null ? legacyAssessment : 0)
  const normalizedTest = test ?? 0
  let normalizedLesson = lesson

  if (normalizedLesson === null) {
    normalizedLesson = clampWeight(100 - normalizedQuiz - normalizedTest)
  }

  return {
    lesson: clampWeight(normalizedLesson),
    quiz: clampWeight(normalizedQuiz),
    test: clampWeight(normalizedTest),
  }
}

export function useCourseWeightSettings({ isOpen, courseId, onFetch, onSave, onSaveSuccess, onClose }) {
  const [lessonWeight, setLessonWeight] = useState("")
  const [quizWeight, setQuizWeight] = useState("")
  const [testWeight, setTestWeight] = useState("")
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
        let source = null

        if (onFetch) {
          source = await onFetch({ courseId })
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

          source = await response.json()
        }

        const weights = readWeights(source)
        setLessonWeight(weights.lesson.toString())
        setQuizWeight(weights.quiz.toString())
        setTestWeight(weights.test.toString())
      } catch {
        setLessonWeight(DEFAULTS.lesson)
        setQuizWeight(DEFAULTS.quiz)
        setTestWeight(DEFAULTS.test)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeightSettings()
  }, [isOpen, courseId, onFetch])

  const parsedLesson = parseWeight(lessonWeight)
  const parsedQuiz = parseWeight(quizWeight)
  const parsedTest = parseWeight(testWeight)

  const isLessonValid = parsedLesson !== null && parsedLesson >= 0 && parsedLesson <= 100
  const isQuizValid = parsedQuiz !== null && parsedQuiz >= 0 && parsedQuiz <= 100
  const isTestValid = parsedTest !== null && parsedTest >= 0 && parsedTest <= 100
  const canSave = isLessonValid && isQuizValid && isTestValid && !isLoading && !isSaving

  const showLessonError = hasTouched && !isLessonValid
  const showQuizError = hasTouched && !isQuizValid
  const showTestError = hasTouched && !isTestValid

  const weightTotal = useMemo(() => {
    if (parsedLesson === null || parsedQuiz === null || parsedTest === null) {
      return null
    }
    return parsedLesson + parsedQuiz + parsedTest
  }, [parsedLesson, parsedQuiz, parsedTest])

  // Keep previous naming: isDirty means weights are ready to save (sum to 100).
  const isDirty = weightTotal !== null && Math.abs(weightTotal - 100) < 0.0001
  const showTotalError = hasTouched && weightTotal !== null && !isDirty

  const handleLessonChange = (event) => {
    setLessonWeight(sanitizeWeightInput(event.target.value))
  }

  const handleQuizChange = (event) => {
    setQuizWeight(sanitizeWeightInput(event.target.value))
  }

  const handleTestChange = (event) => {
    setTestWeight(sanitizeWeightInput(event.target.value))
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
          lessonWeight: parsedLesson,
          quizWeight: parsedQuiz,
          testWeight: parsedTest,
        })
      } else {
        const response = await fetch(`${base_url}/api/grading/save_course_default_weight_settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            course_id: courseId,
            lesson_weight: parsedLesson,
            quiz_weight: parsedQuiz,
            test_weight: parsedTest,
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
    lessonWeight,
    quizWeight,
    testWeight,
    weightTotal,
    isLoading,
    isSaving,
    canSave,
    isDirty,
    showLessonError,
    showQuizError,
    showTestError,
    showTotalError,
    error,
    handleLessonChange,
    handleQuizChange,
    handleTestChange,
    handleSave,
  }
}
