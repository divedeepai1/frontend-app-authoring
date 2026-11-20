export function formatApiErrorEntry(entry) {
  if (entry == null) return ""
  if (typeof entry === "string") return entry.trim()
  if (typeof entry !== "object") return String(entry).trim()

  if (typeof entry.error === "string" && entry.error.trim()) return entry.error.trim()
  if (typeof entry.message === "string" && entry.message.trim()) return entry.message.trim()
  if (typeof entry.detail === "string" && entry.detail.trim()) return entry.detail.trim()

  return ""
}

export function parseApiErrorMessage(payload, fallback = "Something went wrong. Please try again.") {
  if (!payload) return fallback

  if (typeof payload === "string") {
    const trimmed = payload.trim()
    if (!trimmed) return fallback
    try {
      return parseApiErrorMessage(JSON.parse(trimmed), fallback)
    } catch {
      return trimmed
    }
  }

  if (typeof payload !== "object") return fallback

  if (typeof payload.error === "string" && payload.error.trim()) return payload.error.trim()
  if (typeof payload.message === "string" && payload.message.trim()) return payload.message.trim()
  if (typeof payload.detail === "string" && payload.detail.trim()) return payload.detail.trim()

  if (Array.isArray(payload.non_field_errors) && payload.non_field_errors.length) {
    const messages = payload.non_field_errors.map(formatApiErrorEntry).filter(Boolean)
    if (messages.length) return messages.join(" ")
  }

  if (Array.isArray(payload.errors) && payload.errors.length) {
    const messages = payload.errors.map(formatApiErrorEntry).filter(Boolean)
    if (messages.length) return messages.join(" ")
  }

  if (payload.errors && typeof payload.errors === "object" && !Array.isArray(payload.errors)) {
    const parts = []
    Object.entries(payload.errors).forEach(([key, value]) => {
      const messages = Array.isArray(value) ? value : [value]
      messages.forEach((message) => {
        if (message != null && String(message).trim()) {
          parts.push(key === "non_field_errors" ? String(message) : `${key}: ${message}`)
        }
      })
    })
    if (parts.length) return parts.join(" ")
  }

  const fieldMessages = Object.entries(payload)
    .filter(([, value]) => Array.isArray(value) && value.length)
    .map(([key, value]) => `${key}: ${value.join(", ")}`)

  if (fieldMessages.length) return fieldMessages.join(" ")

  return fallback
}

export async function readApiError(response, fallback) {
  const defaultMessage = fallback || `Request failed (${response.status})`
  const text = await response.text()
  if (!text) return defaultMessage

  try {
    return parseApiErrorMessage(JSON.parse(text), defaultMessage)
  } catch {
    return text.trim() || defaultMessage
  }
}
