import { logError } from "./logger"
import { isErrorLoggingIngestUrl } from "./config"
import { HealthThresholds, reportSlowOperation, sanitizeHttpUrl } from "./healthTelemetry"

let fetchPatched = false

function resolveUrl(config) {
  if (!config) {
    return ""
  }
  const base = config.baseURL || ""
  const path = config.url || ""
  if (!path) {
    return base
  }
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  if (!base) {
    return path
  }
  return `${String(base).replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`
}

/**
 * Log a failed HTTP call (axios or fetch) with status + URL for SigNoz.
 */
export function reportNetworkError({
  method,
  url,
  statusCode,
  statusText,
  message,
  source = "network",
}) {
  if (isErrorLoggingIngestUrl(url)) {
    return
  }

  const status = statusCode == null || Number.isNaN(Number(statusCode)) ? 0 : Number(statusCode)
  const safeUrl = sanitizeHttpUrl(url)

  logError("network.request_failed", {
    "error.kind": "network",
    "http.method": (method || "GET").toUpperCase(),
    "http.url": safeUrl,
    "http.status_code": status,
    "http.status_text": statusText || "",
    "exception.message": message || `Request failed with status ${status}`,
    "exception.type": status === 0 ? "NetworkError" : "HttpError",
    "error.source": source,
  })
}

/**
 * Axios response-error interceptor helper (parity with add-in; Teacher LMS uses fetch).
 */
export function reportAxiosError(error) {
  if (!error) {
    return
  }

  const config = error.config || {}
  const response = error.response
  const url = resolveUrl(config)

  if (config._errorLogged) {
    return
  }
  config._errorLogged = true

  reportNetworkError({
    method: config.method,
    url,
    statusCode: response?.status ?? 0,
    statusText: response?.statusText || "",
    message:
      response?.data?.message ||
      error.message ||
      (response ? `HTTP ${response.status}` : "Failed to fetch"),
    source: "axios",
  })
}

/**
 * Patch window.fetch so Teacher LMS fetch failures + slow APIs are captured.
 */
export function installFetchErrorLogging() {
  if (fetchPatched || typeof window === "undefined" || typeof window.fetch !== "function") {
    return
  }
  fetchPatched = true

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input, init) => {
    const method = (init?.method || (typeof input === "object" && input?.method) || "GET").toUpperCase()
    const url = typeof input === "string" ? input : input?.url || String(input)

    if (isErrorLoggingIngestUrl(url)) {
      return originalFetch(input, init)
    }

    const started = Date.now()

    try {
      const response = await originalFetch(input, init)
      const duration = Date.now() - started
      const resolvedUrl = response.url || url

      reportSlowOperation(
        `api.${method}`,
        duration,
        {
          "http.method": method,
          "http.route": sanitizeHttpUrl(resolvedUrl),
          "http.ok": response.ok,
          "error.source": "fetch",
        },
        HealthThresholds.apiMs,
      )

      if (!response.ok) {
        reportNetworkError({
          method,
          url: resolvedUrl,
          statusCode: response.status,
          statusText: response.statusText,
          message: `HTTP ${response.status} ${response.statusText || ""}`.trim(),
          source: "fetch",
        })
      }
      return response
    } catch (err) {
      const duration = Date.now() - started
      reportSlowOperation(
        `api.${method}`,
        duration,
        {
          "http.method": method,
          "http.route": sanitizeHttpUrl(url),
          "http.ok": false,
          "error.source": "fetch",
        },
        HealthThresholds.apiMs,
      )
      reportNetworkError({
        method,
        url,
        statusCode: 0,
        statusText: "",
        message: err?.message || "Failed to fetch",
        source: "fetch",
      })
      throw err
    }
  }
}
