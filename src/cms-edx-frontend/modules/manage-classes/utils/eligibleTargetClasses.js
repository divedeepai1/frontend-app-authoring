import { isClassArchived } from "./classStatus"

/**
 * Classes eligible as move destinations: active only, excluding the source class.
 * @param {Array<object>} classrooms
 * @param {number|string} sourceClassId
 */
export function getEligibleTargetClasses(classrooms, sourceClassId) {
  const sourceId = String(sourceClassId)
  return (classrooms || []).filter((classroom) => {
    if (!classroom || classroom.id == null) {
      return false
    }
    if (String(classroom.id) === sourceId) {
      return false
    }
    if (isClassArchived(classroom)) {
      return false
    }
    return true
  })
}

/**
 * Display name for a student in move UI copy.
 * @param {object|null|undefined} student
 */
export function getStudentDisplayName(student) {
  if (!student) {
    return "Student"
  }
  const full = [student.first_name, student.last_name].filter(Boolean).join(" ").trim()
  return full || student.username || student.email || "Student"
}
