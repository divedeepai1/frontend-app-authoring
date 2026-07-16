export function normalizeClassStatus(status) {
  return String(status || "")
    .trim()
    .toLowerCase()
}

export function isClassArchived(classroom) {
  const status = normalizeClassStatus(classroom?.status)
  return status === "paused" || status === "archived"
}

export function getClassStatusLabel(classroom) {
  return isClassArchived(classroom) ? "Archived" : "Active"
}

export function partitionClassrooms(classrooms) {
  const active = []
  const archived = []

  ;(classrooms || []).forEach((classroom) => {
    if (isClassArchived(classroom)) archived.push(classroom)
    else active.push(classroom)
  })

  return { active, archived }
}
