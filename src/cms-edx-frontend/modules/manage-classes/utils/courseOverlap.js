/**
 * Normalize course ids from a classroom (or raw course list) into a Set of strings.
 * @param {object|Array|null|undefined} classroomOrCourses
 */
export function getCourseIdSet(classroomOrCourses) {
  const courses = Array.isArray(classroomOrCourses)
    ? classroomOrCourses
    : classroomOrCourses?.courses
  const ids = new Set()
  ;(courses || []).forEach((course) => {
    if (course?.id == null || course.id === "") {
      return
    }
    ids.add(String(course.id))
  })
  return ids
}

/**
 * True when every course on the source class is also assigned to the destination class.
 * Empty source course list is treated as fully covered (nothing missing).
 *
 * @param {object|null|undefined} sourceClass
 * @param {object|null|undefined} destinationClass
 */
export function destinationContainsAllSourceCourses(sourceClass, destinationClass) {
  const sourceIds = getCourseIdSet(sourceClass)
  if (sourceIds.size === 0) {
    return true
  }

  const destinationIds = getCourseIdSet(destinationClass)
  for (const id of sourceIds) {
    if (!destinationIds.has(id)) {
      return false
    }
  }
  return true
}

/**
 * Carry-over eligibility for the move-student toggle.
 * @returns {{ canCarryOver: boolean, includeGradesDefault: boolean, helperText: string }}
 */
export function getCarryOverState(sourceClass, destinationClass, { hasTarget = false } = {}) {
  if (!hasTarget) {
    return {
      canCarryOver: false,
      includeGradesDefault: false,
      helperText: "Choose a target class to see whether student data can be carried over.",
    }
  }

  const canCarryOver = destinationContainsAllSourceCourses(sourceClass, destinationClass)
  if (canCarryOver) {
    return {
      canCarryOver: true,
      includeGradesDefault: true,
      helperText:
        "Target class includes all source courses, so student grades and progress can be carried over.",
    }
  }

  return {
    canCarryOver: false,
    includeGradesDefault: false,
    helperText:
      "Target class is missing one or more source courses, so student data cannot be carried over.",
  }
}
