import { isClassArchived } from "./classStatus"

export const CLASS_STATUS_FILTERS = {
  ALL: "all",
  ACTIVE: "active",
  ARCHIVED: "archived",
}

export function filterClassroomsByStatus(classrooms, filter) {
  const list = classrooms || []

  if (filter === CLASS_STATUS_FILTERS.ACTIVE) {
    return list.filter((classroom) => !isClassArchived(classroom))
  }

  if (filter === CLASS_STATUS_FILTERS.ARCHIVED) {
    return list.filter((classroom) => isClassArchived(classroom))
  }

  return list
}
