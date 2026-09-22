/** Default matches current add-in behavior: starting file loads automatically. */
export const DEFAULT_AUTOMATIC_STARTING_FILE_LOAD = true

export function toBooleanSetting(value, fallback = DEFAULT_AUTOMATIC_STARTING_FILE_LOAD) {
  if (typeof value === "boolean") return value
  if (value === 1 || value === "1" || value === "true" || value === "True") return true
  if (value === 0 || value === "0" || value === "false" || value === "False") return false
  return fallback
}

function extractStudentEntries(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.students)) return payload.students
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.settings)) return payload.settings
  return []
}

function readEntryEnabled(entry) {
  if (entry == null) return null
  if (typeof entry === "boolean" || typeof entry === "number" || typeof entry === "string") {
    return toBooleanSetting(entry, null)
  }
  if (typeof entry !== "object") return null
  return toBooleanSetting(
    entry.automatic_starting_file_load ??
      entry.automaticStartingFileLoad ??
      entry.enabled ??
      entry.value,
    null
  )
}

function readEntryStudentId(entry) {
  if (entry == null || typeof entry !== "object") return null
  const id = entry.student_id ?? entry.user_id ?? entry.id
  return id === undefined || id === null ? null : id
}

/**
 * Normalize get_automatic_starting_file_load responses into a stable shape.
 * Supports class-level booleans and per-student records/maps.
 */
export function normalizeAutomaticStartingFileLoadPayload(payload) {
  const studentMap = {}
  const entries = extractStudentEntries(payload)

  entries.forEach((entry) => {
    const studentId = readEntryStudentId(entry)
    const enabled = readEntryEnabled(entry)
    if (studentId === null || enabled === null) return
    studentMap[String(studentId)] = enabled
  })

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const nestedMap =
      payload.student_settings ||
      payload.students_map ||
      payload.by_student ||
      (payload.data && !Array.isArray(payload.data) ? payload.data : null)
    if (nestedMap && typeof nestedMap === "object" && !Array.isArray(nestedMap)) {
      Object.entries(nestedMap).forEach(([studentId, value]) => {
        const enabled = readEntryEnabled(value)
        if (enabled === null) return
        studentMap[String(studentId)] = enabled
      })
    }
  }

  const classLevel = toBooleanSetting(
    payload?.automatic_starting_file_load ??
      payload?.automaticStartingFileLoad ??
      payload?.data?.automatic_starting_file_load,
    null
  )

  const values = Object.values(studentMap)
  const resolvedClass =
    classLevel !== null
      ? classLevel
      : values.length > 0
        ? values.every(Boolean)
        : DEFAULT_AUTOMATIC_STARTING_FILE_LOAD

  return {
    classEnabled: resolvedClass,
    studentMap,
  }
}

export function resolveStudentEnabled(studentMap, studentId, classEnabled) {
  if (studentId === undefined || studentId === null) return classEnabled
  const key = String(studentId)
  if (Object.prototype.hasOwnProperty.call(studentMap || {}, key)) {
    return Boolean(studentMap[key])
  }
  return classEnabled
}
