export const MIN_ATTEMPTS = 1
export const MAX_ATTEMPTS = 20

export function buildAttemptOptions() {
  return Array.from({ length: MAX_ATTEMPTS - MIN_ATTEMPTS + 1 }, (_, idx) => MIN_ATTEMPTS + idx)
}

export function normalizeAttemptsPayload(payload) {
  if (!payload) return null
  if (Array.isArray(payload)) return payload
  if (typeof payload === "object") {
    if (Array.isArray(payload.data)) return payload.data
    if (payload.data && typeof payload.data === "object") return payload.data
    if (Array.isArray(payload.results)) return payload.results
    return payload
  }
  return null
}

export function parseAttemptEntry(entry) {
  const toNullableNumber = (value) => {
    if (value === null || value === undefined) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  if (entry && typeof entry === "object") {
    const allottedRaw =
      entry.num_of_attempts ?? entry.attempts ?? entry.attempts_allowed ?? entry.max_attempts ?? null
    const numberOfAttemptsRaw =
      entry.num_of_attempts ??
      entry.attempts ??
      entry.number_of_attempts ??
      entry.remaining_attempts ??
      entry.attempts_remaining ??
      entry.remaining ??
      allottedRaw
    return {
      allotted: toNullableNumber(allottedRaw),
      numberOfAttempts: toNullableNumber(numberOfAttemptsRaw),
    }
  }
  const value = toNullableNumber(entry)
  return { allotted: value, numberOfAttempts: value }
}

export function toStudentAttemptMap(data) {
  if (!data || typeof data !== "object") return {}
  if (Array.isArray(data)) {
    return data.reduce((acc, entry) => {
      const id = entry?.student_id ?? entry?.id ?? entry?.user_id ?? entry?.studentId
      if (id !== undefined && id !== null) acc[String(id)] = parseAttemptEntry(entry)
      return acc
    }, {})
  }
  if (data.attempts_by_student && typeof data.attempts_by_student === "object") {
    return Object.keys(data.attempts_by_student).reduce((acc, key) => {
      acc[key] = parseAttemptEntry(data.attempts_by_student[key])
      return acc
    }, {})
  }
  if (data.student_attempts && typeof data.student_attempts === "object") {
    return Object.keys(data.student_attempts).reduce((acc, key) => {
      acc[key] = parseAttemptEntry(data.student_attempts[key])
      return acc
    }, {})
  }
  if (Array.isArray(data.students)) {
    return data.students.reduce((acc, student) => {
      const id = student?.id ?? student?.user_id ?? student?.student_id
      if (id !== undefined && id !== null) acc[String(id)] = parseAttemptEntry(student)
      return acc
    }, {})
  }
  return {}
}

export function getRubricAttemptsAllotted(data) {
  if (Array.isArray(data)) {
    const firstFound = data.find((entry) => {
      const value = Number(entry?.attempts_allotted)
      return Number.isInteger(value) && value >= MIN_ATTEMPTS
    })
    return firstFound ? Number(firstFound.attempts_allotted) : null
  }
  if (data && typeof data === "object") {
    const value = Number(
      data.attempts_allotted ?? data.attempt_limit ?? data.max_attempts ?? data.num_of_attempts
    )
    return Number.isInteger(value) && value >= MIN_ATTEMPTS ? value : null
  }
  return null
}
