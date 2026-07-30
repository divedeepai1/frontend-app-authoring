/**
 * Format a classroom created timestamp for display (human-readable).
 * @param {string|number|Date|null|undefined} value
 * @returns {string} Formatted date or empty string when missing/invalid
 */
export function formatClassCreatedDate(value) {
  if (value == null || value === "") {
    return ""
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
