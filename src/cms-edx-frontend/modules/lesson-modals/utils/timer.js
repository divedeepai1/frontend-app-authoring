export const TIMER_MODE_OPTIONS = [
  { label: "Display timer only", value: "display" },
  { label: "Lock lesson when time ends", value: "lock" },
]

export function normalizeTimerPayload(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (typeof payload === "object") {
    if (Array.isArray(payload.data)) return payload.data
    if (Array.isArray(payload.results)) return payload.results
    if (payload.data && typeof payload.data === "object") return [payload.data]
    return [payload]
  }
  return []
}

export function secondsToHoursMinutes(totalSeconds) {
  const safeSeconds = Number.isInteger(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0
  return {
    hours: Math.floor(safeSeconds / 3600),
    minutes: Math.floor((safeSeconds % 3600) / 60),
  }
}

export function hoursMinutesToSeconds(hours, minutes) {
  const safeHours = Number.isInteger(hours) && hours >= 0 ? hours : 0
  const safeMinutes = Number.isInteger(minutes) && minutes >= 0 ? minutes : 0
  return safeHours * 3600 + safeMinutes * 60
}

export function formatTwoDigits(value) {
  return String(value).padStart(2, "0")
}

export function buildHourOptions() {
  return Array.from({ length: 24 }, (_, i) => formatTwoDigits(i))
}

export function buildMinuteOptions() {
  return Array.from({ length: 60 }, (_, i) => formatTwoDigits(i))
}

export function validateTimerDuration(hours, minutes) {
  const parsedHours = Number(hours)
  const parsedMinutes = Number(minutes)
  if (!Number.isInteger(parsedHours) || parsedHours < 0) {
    return "Hours must be a whole number greater than or equal to 0."
  }
  if (!Number.isInteger(parsedMinutes) || parsedMinutes < 0 || parsedMinutes > 59) {
    return "Minutes must be a whole number between 0 and 59."
  }
  if (hoursMinutesToSeconds(parsedHours, parsedMinutes) <= 0) {
    return "Please enter a valid timer duration."
  }
  return ""
}

export function validateTimerMode(mode) {
  if (mode !== "display" && mode !== "lock") return "Please select a valid timer mode."
  return ""
}
