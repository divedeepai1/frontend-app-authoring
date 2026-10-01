const EMPTY_DISPLAY = "—"

function isBlank(value) {
  return value == null || String(value).trim() === ""
}

function isNaToken(value) {
  const text = String(value).trim().toLowerCase()
  return text === "n/a" || text === "na" || text === "null" || text === "none"
}

/** Parse ISO (or other Date-parseable) values into a readable date/time for UX. */
export function formatReportDate(value, { includeTime = true } = {}) {
  if (isBlank(value) || isNaToken(value)) return EMPTY_DISPLAY
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateInstance(value, includeTime)
  }

  const text = String(value).trim()
  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) return text

  return formatDateInstance(parsed, includeTime)
}

function formatDateInstance(date, includeTime) {
  const opts = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
  if (includeTime) {
    opts.hour = "2-digit"
    opts.minute = "2-digit"
  }
  return date.toLocaleString("en-US", opts)
}

/**
 * Backend durations are in seconds. Display as minutes for UX.
 * Returns "N/A" when no timer was configured.
 */
export function formatDurationMinutes(value, { emptyAs = "N/A" } = {}) {
  if (isBlank(value) || isNaToken(value)) return emptyAs

  if (typeof value === "string" && /min|hr|hour|sec/i.test(value) && Number.isNaN(Number(value))) {
    return value
  }

  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds < 0) return emptyAs
  if (seconds === 0) return emptyAs === "N/A" ? "N/A" : "0 min"

  const totalMinutes = seconds / 60
  if (totalMinutes < 1) {
    return `${Math.round(seconds)} sec`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)

  if (hours <= 0) {
    return `${Math.round(totalMinutes)} min`
  }
  if (minutes === 0) {
    return hours === 1 ? "1 hr" : `${hours} hr`
  }
  return `${hours} hr ${minutes} min`
}
