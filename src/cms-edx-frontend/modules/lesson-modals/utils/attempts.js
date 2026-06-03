export const MIN_ATTEMPTS = 1
export const MAX_ATTEMPTS = 20

export function buildAttemptOptions() {
  return Array.from({ length: MAX_ATTEMPTS - MIN_ATTEMPTS + 1 }, (_, idx) => MIN_ATTEMPTS + idx)
}

export function normalizeAttemptsPayload(payload) {
  if (!payload) return null
  if (Array.isArray(payload)) {
    return {
      students: payload,
    }
  }
  if (typeof payload === "object") {
    if (Array.isArray(payload.data)) {
      return {
        ...payload,
        students: payload.data,
      }
    }
    if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
      return {
        ...payload,
        ...payload.data,
      }
    }
    if (Array.isArray(payload.results)) {
      return {
        ...payload,
        students: payload.results,
      }
    }
    if (Array.isArray(payload.students)) return payload
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

export function parseAttemptsLimitValue(raw) {
  if (raw === undefined) return undefined
  if (raw === null) return null

  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase()
    if (!normalized || normalized === "unlimited" || normalized === "infinity") {
      return null
    }
    const parsed = Number(raw)
    if (Number.isInteger(parsed) && parsed >= MIN_ATTEMPTS) {
      return Math.min(parsed, MAX_ATTEMPTS)
    }
    return undefined
  }

  const parsed = Number(raw)
  if (Number.isInteger(parsed) && parsed >= MIN_ATTEMPTS) {
    return Math.min(parsed, MAX_ATTEMPTS)
  }
  if (parsed === 0) return null
  return undefined
}

function readAttemptsLimitFromObject(source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return undefined

  const numericCandidates = [
    source.num_of_attempts,
    source.rubric_num_of_attempts,
    source.default_num_of_attempts,
    source.max_attempts,
    source.attempt_limit,
    source.attempts_allotted,
  ]

  for (const candidate of numericCandidates) {
    if (candidate === undefined) continue
    const parsed = parseAttemptsLimitValue(candidate)
    if (Number.isInteger(parsed)) return parsed
  }

  const unlimitedCandidates = [source.num_of_attempts, source.attempts_allotted]
  for (const candidate of unlimitedCandidates) {
    if (candidate === null) return null
    if (typeof candidate === "string") {
      const normalized = candidate.trim().toLowerCase()
      if (normalized === "unlimited" || normalized === "infinity") return null
    }
  }

  return undefined
}

export function deriveClassAttemptsFromStudentMap(studentAttemptMap) {
  const allottedValues = Object.values(studentAttemptMap || {})
    .map((entry) => entry?.allotted)
    .filter((value) => Number.isInteger(value) && value >= MIN_ATTEMPTS)

  if (allottedValues.length === 0) return undefined

  const uniqueValues = [...new Set(allottedValues)]
  if (uniqueValues.length === 1) return uniqueValues[0]
  return undefined
}

export function resolveClassAttemptsLimit(rawPayload, normalizedData, rubricDefaultAttempts) {
  const fromRaw = getRubricAttemptsAllotted(rawPayload)
  if (fromRaw !== undefined) return fromRaw

  const fromNormalized = getRubricAttemptsAllotted(normalizedData)
  if (fromNormalized !== undefined) return fromNormalized

  const fromStudents = deriveClassAttemptsFromStudentMap(
    toStudentAttemptMap(normalizedData)
  )
  if (fromStudents !== undefined) return fromStudents

  if (rubricDefaultAttempts !== undefined) return rubricDefaultAttempts

  return undefined
}

export function getRubricAttemptsAllotted(data) {
  if (!data) return undefined

  if (Array.isArray(data)) {
    for (const entry of data) {
      const fromEntry = readAttemptsLimitFromObject(entry)
      if (fromEntry !== undefined) return fromEntry
    }
    return undefined
  }

  if (typeof data === "object") {
    const directSources = [data, data.rubric, data.data, data.result, data.settings]
    for (const source of directSources) {
      const parsed = readAttemptsLimitFromObject(source)
      if (parsed !== undefined) return parsed
    }

    if (Array.isArray(data.students)) {
      return getRubricAttemptsAllotted(data.students)
    }
    if (Array.isArray(data.results)) {
      return getRubricAttemptsAllotted(data.results)
    }
  }

  return undefined
}

export function toDropdownAttemptsValue(value, fallback = MIN_ATTEMPTS) {
  if (value === null) return "unlimited"
  if (value !== undefined && Number.isInteger(value) && value >= MIN_ATTEMPTS) {
    return Math.min(value, MAX_ATTEMPTS)
  }
  if (fallback === null) return "unlimited"
  if (Number.isInteger(fallback) && fallback >= MIN_ATTEMPTS) {
    return Math.min(fallback, MAX_ATTEMPTS)
  }
  return MIN_ATTEMPTS
}
