import { logs, SeverityNumber } from "@opentelemetry/api-logs"
import { getContextAttributes } from "./contextAttributes"
import { recordErrorSpan } from "./tracer"

const LOGGER_NAME = "lms-frontend-errors"

function getLogger() {
  return logs.getLogger(LOGGER_NAME)
}

function emit(severityNumber, severityText, body, attrs = {}) {
  try {
    getLogger().emit({
      body,
      severityNumber,
      severityText,
      attributes: {
        ...getContextAttributes(),
        ...attrs,
      },
    })
  } catch (err) {
    // Never let telemetry break the product UI
    console.error("Error logging emit failed:", err)
  }
}

export function logInfo(body, attrs = {}) {
  emit(SeverityNumber.INFO, "INFO", body, attrs)
}

export function logWarn(body, attrs = {}) {
  emit(SeverityNumber.WARN, "WARN", body, attrs)
}

export function logError(body, attrs = {}) {
  emit(SeverityNumber.ERROR, "ERROR", body, attrs)
  // Mirror errors as spans so SigNoz Services / Traces are populated.
  recordErrorSpan(body, attrs)
}
