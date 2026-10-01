/**
 * Content types returned by grading/report APIs after assessment → quiz/test split.
 * Legacy "assessment" is still treated like quiz/test for styling.
 */

export const CONTENT_TYPES = {
  LESSON: "lesson",
  QUIZ: "quiz",
  TEST: "test",
}

const LABEL_BY_TYPE = {
  [CONTENT_TYPES.LESSON]: "Lesson",
  [CONTENT_TYPES.QUIZ]: "Quiz",
  [CONTENT_TYPES.TEST]: "Test",
  assessment: "Assessment",
}

/**
 * @param {object|string|null|undefined} source - raw type string or object with type/content_type
 */
export function resolveContentTypeRaw(source) {
  if (source == null) return ""
  if (typeof source === "string" || typeof source === "number") {
    return String(source).trim().toLowerCase()
  }
  return String(
    source.content_type || source.type || source.item_type || source.lesson_type || ""
  )
    .trim()
    .toLowerCase()
}

export function normalizeContentType(source, { isAssessment = false } = {}) {
  const raw = resolveContentTypeRaw(source)
  if (raw === CONTENT_TYPES.LESSON || raw === CONTENT_TYPES.QUIZ || raw === CONTENT_TYPES.TEST) {
    return raw
  }
  if (
    isAssessment === true ||
    raw === "assessment" ||
    raw.includes("assessment") ||
    source?.is_assessment === true ||
    source?.assessment === true
  ) {
    return CONTENT_TYPES.QUIZ
  }
  if (raw.includes("quiz")) return CONTENT_TYPES.QUIZ
  if (raw.includes("test")) return CONTENT_TYPES.TEST
  if (raw.includes("lesson")) return CONTENT_TYPES.LESSON
  return CONTENT_TYPES.LESSON
}

/** Quiz, test, and legacy assessment share the former assessment highlight styles. */
export function usesAssessmentStyle(source) {
  const type = normalizeContentType(source, {
    isAssessment: source?.is_assessment === true || source?.assessment === true,
  })
  const raw = resolveContentTypeRaw(source)
  return (
    type === CONTENT_TYPES.QUIZ ||
    type === CONTENT_TYPES.TEST ||
    raw.includes("assessment")
  )
}

export function formatContentTypeLabel(source) {
  const raw = resolveContentTypeRaw(source)
  if (!raw) return "Lesson"
  if (LABEL_BY_TYPE[raw]) return LABEL_BY_TYPE[raw]
  const normalized = normalizeContentType(source)
  return LABEL_BY_TYPE[normalized] || raw.charAt(0).toUpperCase() + raw.slice(1)
}
