import { trace, SpanStatusCode } from "@opentelemetry/api"
import { getContextAttributes } from "./contextAttributes"

const TRACER_NAME = "lms-frontend-errors"

function getTracer() {
  return trace.getTracer(TRACER_NAME)
}

function applyAttributes(span, attrs = {}) {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      span.setAttribute(key, value)
      return
    }
    span.setAttribute(key, String(value))
  })
}

/**
 * Emits an ERROR span so the event appears in SigNoz Traces / Services
 * (Logs alone do not populate those views).
 */
export function recordErrorSpan(name, attrs = {}) {
  try {
    const span = getTracer().startSpan(name || "lms.error")
    const allAttrs = {
      ...getContextAttributes(),
      ...attrs,
    }
    applyAttributes(span, allAttrs)

    const message = attrs["exception.message"] || name || "Error"
    const error = new Error(String(message))
    if (attrs["exception.stacktrace"]) {
      error.stack = String(attrs["exception.stacktrace"])
    }
    span.recordException(error)
    span.setStatus({ code: SpanStatusCode.ERROR, message: String(message) })
    span.end()
  } catch (err) {
    console.error("Error span emit failed:", err)
  }
}

/** Lightweight span so Services lists the LMS even before the first error. */
export function recordBootstrapSpan() {
  try {
    const span = getTracer().startSpan("app.bootstrap")
    applyAttributes(span, getContextAttributes())
    span.setStatus({ code: SpanStatusCode.OK })
    span.end()
  } catch {
    // ignore
  }
}
