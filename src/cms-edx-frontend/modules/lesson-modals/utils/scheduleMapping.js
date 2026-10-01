import { toDateOnly } from "./dates"
import { mapStudentDisplay } from "./students"

function normalizeScheduleList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.schedules)) return payload.schedules
  if (Array.isArray(payload?.student_schedules)) return payload.student_schedules
  return []
}

export function mapScheduleEntry(entry) {
  if (!entry || typeof entry !== "object") return {}
  return {
    start_date:
      entry.start_date ??
      entry.startDate ??
      entry.start ??
      entry.access_start_date ??
      null,
    due_date:
      entry.due_date ?? entry.dueDate ?? entry.due ?? entry.access_due_date ?? null,
  }
}

function mergeScheduleEntry(target, source) {
  if (!source) return target
  const next = { ...target }
  if (source.start_date != null && source.start_date !== "") next.start_date = source.start_date
  if (source.due_date != null && source.due_date !== "") next.due_date = source.due_date
  return next
}

function isScheduleEntry(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  return (
    "start_date" in value ||
    "due_date" in value ||
    "startDate" in value ||
    "dueDate" in value ||
    "start" in value ||
    "due" in value
  )
}

function indexScheduleByStudentKey(payload) {
  const byStudent = {}

  const addEntry = (key, entry) => {
    const normalizedKey = String(key ?? "").trim()
    if (!normalizedKey || !entry) return
    byStudent[normalizedKey] = mergeScheduleEntry(byStudent[normalizedKey], mapScheduleEntry(entry))
  }

  normalizeScheduleList(payload).forEach((item) => {
    addEntry(item.student_id ?? item.studentId ?? item.user_id ?? item.id, item)
  })

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const nestedMaps = [
      payload.students,
      payload.student_schedules,
      payload.status_dates_by_student,
      payload.schedules_by_student,
      payload.student_status_dates,
    ]

    nestedMaps.forEach((map) => {
      if (map && typeof map === "object" && !Array.isArray(map)) {
        Object.entries(map).forEach(([key, entry]) => addEntry(key, entry))
      }
    })

    const skipKeys = new Set([
      "data",
      "results",
      "schedules",
      "students",
      "student_schedules",
      "status_dates_by_student",
      "schedules_by_student",
      "student_status_dates",
      "success",
      "message",
      "error",
      "rubric",
    ])

    Object.entries(payload).forEach(([key, value]) => {
      if (skipKeys.has(key)) return
      if (isScheduleEntry(value)) addEntry(key, value)
    })

    const rubricLevel = payload.rubric && typeof payload.rubric === "object" ? payload.rubric : payload
    const rootStart =
      rubricLevel.start_date ??
      rubricLevel.startDate ??
      rubricLevel.rubric_start_date ??
      null
    const rootDue =
      rubricLevel.due_date ?? rubricLevel.dueDate ?? rubricLevel.rubric_due_date ?? null

    if (rootStart || rootDue) {
      byStudent.__class_defaults__ = mapScheduleEntry({
        start_date: rootStart,
        due_date: rootDue,
      })
    }
  }

  return byStudent
}

function resolveStudentSchedule(byStudent, student) {
  const base = mapStudentDisplay(student)
  const keys = [
    String(base.id ?? ""),
    String(base.email ?? ""),
    String(student?.user_id ?? ""),
    String(student?.student_id ?? ""),
  ].filter(Boolean)

  let merged = {}
  keys.forEach((key) => {
    if (byStudent[key]) merged = mergeScheduleEntry(merged, byStudent[key])
  })

  if (base.email) {
    const emailKey = base.email.toLowerCase()
    if (byStudent[emailKey]) merged = mergeScheduleEntry(merged, byStudent[emailKey])
  }

  if (!merged.start_date && !merged.due_date && byStudent.__class_defaults__) {
    merged = mergeScheduleEntry(merged, byStudent.__class_defaults__)
  }

  return merged
}

export function buildScheduleRows(students, payload) {
  const byStudent = indexScheduleByStudentKey(payload)

  return (students || []).map((student) => {
    const base = mapStudentDisplay(student)
    const existing = resolveStudentSchedule(byStudent, student)
    return {
      ...base,
      start: toDateOnly(existing.start_date),
      due: toDateOnly(existing.due_date),
    }
  })
}

function deriveMajorityDate(rows, field) {
  const list = Array.isArray(rows) ? rows : []
  if (!list.length) return ""

  const counts = new Map()
  list.forEach((row) => {
    const value = String(row[field] || "").trim()
    counts.set(value, (counts.get(value) || 0) + 1)
  })

  let maxCount = 0
  const leaders = []

  counts.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count
      leaders.length = 0
      leaders.push(value)
    } else if (count === maxCount) {
      leaders.push(value)
    }
  })

  if (leaders.length !== 1) return ""
  return leaders[0]
}

export function deriveBulkDatesFromRows(rows) {
  return {
    start: deriveMajorityDate(rows, "start"),
    due: deriveMajorityDate(rows, "due"),
  }
}
