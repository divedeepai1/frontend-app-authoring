export const CONTENT_TYPES = {
  LESSON: "lesson",
  QUIZ: "quiz",
  TEST: "test",
}

export const CONTENT_TYPE_OPTIONS = [
  { value: CONTENT_TYPES.LESSON, label: "Lesson" },
  { value: CONTENT_TYPES.QUIZ, label: "Quiz" },
  { value: CONTENT_TYPES.TEST, label: "Test" },
]

/**
 * Normalize API/UI content_type to lesson | quiz | test.
 * Falls back from legacy is_assessment=true → quiz.
 */
export function normalizeContentType(value, { isAssessment = false } = {}) {
  const raw = String(value || "")
    .trim()
    .toLowerCase()

  if (
    raw === CONTENT_TYPES.LESSON ||
    raw === CONTENT_TYPES.QUIZ ||
    raw === CONTENT_TYPES.TEST
  ) {
    return raw
  }

  if (isAssessment === true || raw === "assessment" || raw === "true") {
    return CONTENT_TYPES.QUIZ
  }

  return CONTENT_TYPES.LESSON
}

/** Quiz and test use the former assessment timer/attempts behavior. */
export function isTimedContentType(contentType) {
  const normalized = normalizeContentType(contentType)
  return normalized === CONTENT_TYPES.QUIZ || normalized === CONTENT_TYPES.TEST
}
