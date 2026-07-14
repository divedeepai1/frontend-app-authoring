import { formatDurationMinutes, formatReportDate } from "./formatDisplay"

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function unwrapPayload(payload) {
  if (!payload || typeof payload !== "object") return {}
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data
  }
  return payload
}

function resolveStudentName(item = {}) {
  const combined = `${item.first_name || ""} ${item.last_name || ""}`.trim()
  return (
    item.student_name ||
    item.name ||
    item.full_name ||
    combined ||
    item.email ||
    (item.user_id != null ? `Student ${item.user_id}` : "Student")
  )
}

function isAssessmentColumn(column = {}) {
  const type = String(column.type || column.content_type || column.item_type || "").toLowerCase()
  if (type.includes("assessment") || type === "assessment") return true
  if (column.is_assessment === true || column.assessment === true) return true
  return false
}

function pickScore(value) {
  if (value == null) return null
  if (typeof value === "number" || typeof value === "string") return value
  if (typeof value === "object") {
    return value.highest_score ?? value.score ?? value.grade ?? value.value ?? null
  }
  return null
}

export function mapStudentsForReportRequest(students) {
  return asArray(students).map((student) => ({
    user_id: Number(student.id ?? student.user_id) || student.id,
    name:
      student.name ||
      `${student.firstName || student.first_name || ""} ${student.lastName || student.last_name || ""}`.trim() ||
      student.email ||
      `Student ${student.id}`,
  }))
}

export function mapRubricsForReportRequest(rubrics) {
  return asArray(rubrics)
    .map((rubric) => ({
      rubric_id: String(rubric.id ?? rubric.rubric_id ?? ""),
      title: String(rubric.title || rubric.name || ""),
    }))
    .filter((item) => item.rubric_id)
}

export function normalizeGradeReport(payload, fallbackStudents = [], fallbackRubrics = []) {
  const body = unwrapPayload(payload)
  const columnsFromApi = asArray(body.columns || body.lessons || body.rubrics || body.assessments)
  const columns =
    columnsFromApi.length > 0
      ? columnsFromApi.map((column, index) => {
          const id = column.rubric_id ?? column.id ?? column.lesson_id ?? `col-${index}`
          return {
            id: String(id),
            title: column.title || column.name || `Item ${index + 1}`,
            isAssessment: isAssessmentColumn(column),
          }
        })
      : fallbackRubrics.map((rubric, index) => ({
          id: String(rubric.id),
          title: rubric.title || `Item ${index + 1}`,
          isAssessment: false,
        }))

  const rowsFromApi = asArray(body.rows || body.students || body.grade_report || body.results)
  const fallbackById = new Map(fallbackStudents.map((s) => [String(s.id), s]))

  const rows = rowsFromApi.map((row, index) => {
    const studentId = row.user_id ?? row.student_id ?? row.id ?? index
    const fallback = fallbackById.get(String(studentId))
    const scoresSource = row.scores || row.grades || row.lessons || row.grade_map || {}
    const scores = {}
    columns.forEach((column) => {
      let raw = null
      if (Array.isArray(scoresSource)) {
        const match = scoresSource.find(
          (item) => String(item?.rubric_id ?? item?.id ?? item?.lesson_id) === column.id
        )
        raw = match
      } else if (scoresSource && typeof scoresSource === "object") {
        raw = scoresSource[column.id] ?? scoresSource[String(column.id)]
      }
      scores[column.id] = pickScore(raw)
    })
    return {
      id: String(studentId),
      studentName: resolveStudentName(row) || fallback?.name || `Student ${studentId}`,
      average: row.average ?? row.avg_score ?? row.overall_average ?? row.overall_grade ?? null,
      scores,
    }
  })

  return { columns, rows }
}

export function normalizeLessonActivityReport(payload) {
  const body = unwrapPayload(payload)
  const rows = asArray(body.rows || body.attempts || body.results || body.lesson_activity || body.data)

  const mapped = rows.map((row, index) => {
    const timerRaw = row.timer_duration ?? row.timer ?? row.time_allowed
    const timeToCompleteRaw = row.time_to_complete ?? row.completion_time ?? row.duration
    const submittedRaw = row.submitted_date ?? row.submitted_at ?? row.submission_date ?? row.completed_at

    return {
      id: String(
        row.id ??
          `${row.user_id || "s"}-${row.rubric_id || "l"}-${row.attempt_number || row.attempt || index}`
      ),
      studentId: String(row.user_id ?? row.student_id ?? ""),
      studentName: resolveStudentName(row),
      lessonName: row.lesson_name || row.rubric_title || row.title || row.name || "Lesson",
      type: row.type || row.content_type || row.item_type || "Lesson",
      attemptNumber: Number(row.attempt_number ?? row.attempt ?? row.attempt_no ?? index + 1),
      score: row.score ?? row.grade ?? null,
      timerDuration: formatDurationMinutes(timerRaw, { emptyAs: "N/A" }),
      timeToComplete: formatDurationMinutes(timeToCompleteRaw, { emptyAs: "—" }),
      submittedDate: formatReportDate(submittedRaw, { includeTime: true }),
    }
  })

  return mapped.sort((a, b) => {
    const byStudent = String(a.studentName).localeCompare(String(b.studentName))
    if (byStudent !== 0) return byStudent
    const byLesson = String(a.lessonName).localeCompare(String(b.lessonName))
    if (byLesson !== 0) return byLesson
    return Number(a.attemptNumber) - Number(b.attemptNumber)
  })
}

export function normalizeOverdueLessonsReport(payload) {
  const body = unwrapPayload(payload)
  const rows = asArray(body.rows || body.overdue || body.results || body.overdue_lessons || body.data)

  return rows.map((row, index) => ({
    id: String(row.id ?? `${row.user_id || "s"}-${row.rubric_id || "l"}-${index}`),
    studentId: String(row.user_id ?? row.student_id ?? ""),
    studentName: resolveStudentName(row),
    lessonName: row.lesson_name || row.rubric_title || row.title || row.name || "Lesson",
    type: row.type || row.content_type || row.item_type || "Lesson",
    dueDate: formatReportDate(row.due_date ?? row.due_at, { includeTime: false }),
    daysOverdue: row.days_overdue ?? row.overdue_days ?? row.days ?? "—",
  }))
}
