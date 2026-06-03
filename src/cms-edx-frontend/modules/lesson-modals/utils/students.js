export function normalizeStudentIds(students) {
  if (!Array.isArray(students)) return []
  return students
    .map((s) => s?.id ?? s?.user_id ?? s?.student_id)
    .filter((id) => id !== undefined && id !== null)
}

export function mapStudentDisplay(student) {
  const id = student?.id ?? student?.user_id ?? student?.student_id
  const fullName = [student?.first_name, student?.last_name].filter(Boolean).join(" ").trim()
  return {
    id,
    name: student?.name || student?.full_name || fullName || student?.email || `Student ${id}`,
    email: student?.email || "",
  }
}
