import { logError } from "./logger"

let handlersInstalled = false

/**
 * Captures uncaught JS errors and unhandled promise rejections.
 */
export function installGlobalErrorHandlers() {
  if (handlersInstalled || typeof window === "undefined") {
    return
  }
  handlersInstalled = true

  window.addEventListener("error", (event) => {
    logError("window.onerror", {
      "error.kind": "javascript",
      "exception.message": event.message || "Script error",
      "exception.type": event.error?.name || "Error",
      "exception.stacktrace": event.error?.stack || "",
      "exception.source": event.filename || "",
      "exception.lineno": event.lineno ?? "",
      "exception.colno": event.colno ?? "",
    })
  })

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason
    const message =
      reason?.message ||
      (typeof reason === "string" ? reason : String(reason ?? "Unhandled rejection"))

    logError("unhandledrejection", {
      "error.kind": "javascript",
      "exception.message": message,
      "exception.type": reason?.name || "UnhandledRejection",
      "exception.stacktrace": reason?.stack || "",
    })
  })
}

/**
 * Report a React error-boundary crash.
 */
export function reportReactError(error, info) {
  logError("react.error_boundary", {
    "error.kind": "javascript",
    "exception.message": error?.message || String(error),
    "exception.type": error?.name || "Error",
    "exception.stacktrace": error?.stack || "",
    "exception.component_stack": info?.componentStack || "",
  })
}
