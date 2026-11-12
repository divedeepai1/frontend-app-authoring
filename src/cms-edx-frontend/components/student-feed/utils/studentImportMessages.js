import { formatApiErrorEntry, parseApiErrorMessage } from "../../../modules/account-settings/utils/apiError"

/**
 * Format one CSV import row error for toast display.
 * Prefers backend `error` / `message` text (never "[object Object]").
 */
export function formatStudentImportRowError(entry) {
  const message = formatApiErrorEntry(entry)
  if (!message) return ""

  if (!entry || typeof entry !== "object") return message

  const rowLabel =
    entry.row != null
      ? `Row ${entry.row}`
      : entry.line != null
        ? `Row ${entry.line}`
        : ""
  const identity = entry.username || entry.email || ""
  const prefix = [rowLabel, identity].filter(Boolean).join(" · ")
  return prefix ? `${prefix}: ${message}` : message
}

export function formatStudentImportRowErrors(errors, { limit = 5 } = {}) {
  const list = Array.isArray(errors) ? errors : []
  const messages = list.map(formatStudentImportRowError).filter(Boolean)
  if (!messages.length) return ""

  const shown = messages.slice(0, limit)
  const more = messages.length > limit ? ` and ${messages.length - limit} more` : ""
  return `${shown.join(" · ")}${more}`
}

export function summarizeStudentImportResults(results = {}) {
  const created = Array.isArray(results.created) ? results.created : []
  const updated = Array.isArray(results.updated) ? results.updated : []
  const skipped = Array.isArray(results.skipped) ? results.skipped : []
  const errors = Array.isArray(results.errors) ? results.errors : []

  return {
    created,
    updated,
    skipped,
    errors,
    countsMessage: `Created: ${created.length} | Updated: ${updated.length} | Skipped: ${skipped.length} | Errors: ${errors.length}`,
    errorDetails: formatStudentImportRowErrors(errors),
    hasErrors: errors.length > 0,
    hasSuccess: created.length > 0 || updated.length > 0,
  }
}

export function resolveStudentImportFailureMessage(payload, fallback = "Import failed.") {
  const summary = summarizeStudentImportResults(payload?.results || {})
  if (summary.errorDetails) return summary.errorDetails
  return parseApiErrorMessage(payload, fallback)
}
