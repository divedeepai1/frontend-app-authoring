export function parseNumericScore(value) {
  if (value == null || value === "") return null
  if (typeof value === "number" && Number.isFinite(value)) return value
  const cleaned = String(value).replace(/%/g, "").trim()
  if (!cleaned || cleaned === "—" || cleaned.toLowerCase() === "n/a") return null
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

export function formatScore(value) {
  const num = parseNumericScore(value)
  if (num == null) return "N/A"
  return Number.isInteger(num) ? String(num) : num.toFixed(1)
}

export function scoreToneClass(value) {
  const num = parseNumericScore(value)
  if (num == null) return "tp-report-score--na"
  if (num >= 80) return "tp-report-score--high"
  if (num < 70) return "tp-report-score--low"
  return "tp-report-score--mid"
}
