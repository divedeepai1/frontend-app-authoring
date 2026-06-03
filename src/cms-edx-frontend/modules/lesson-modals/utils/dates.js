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
  if (!start || !due) return "Start date and due date are required."
  const s = new Date(start)
  const d = new Date(due)
  if (Number.isNaN(s.getTime()) || Number.isNaN(d.getTime())) return "Dates must be valid."
  if (s > d) return "Start date cannot be after due date."
  return ""
}
