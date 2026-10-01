export function toDateOnly(isoString) {
  if (!isoString) return ""
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function toIsoFromDateOnly(value) {
  if (!value) return null
  const date = new Date(`${value}T13:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export function validateDateRange(start, due) {
  const hasStart = Boolean(start)
  const hasDue = Boolean(due)

  if (!hasStart && !hasDue) {
    return "Enter a start date, due date, or both."
  }

  if (hasStart) {
    const s = new Date(start)
    if (Number.isNaN(s.getTime())) return "Start date must be valid."
  }

  if (hasDue) {
    const d = new Date(due)
    if (Number.isNaN(d.getTime())) return "Due date must be valid."
  }

  if (hasStart && hasDue) {
    const s = new Date(start)
    const d = new Date(due)
    if (s > d) return "Start date cannot be after due date."
  }

  return ""
}
