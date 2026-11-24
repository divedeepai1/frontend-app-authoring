import { logInfo, logWarn } from "./logger"
import { isErrorLoggingIngestUrl } from "./config"

/** Stable event names for SigNoz filters. */
export const HealthEvent = {
  TELEMETRY_READY: "app.telemetry_ready",
  APP_READY: "app.ready",
  PERF_SLOW: "perf.slow_operation",
  UI_STUCK: "ui.stuck",
}

/** Warn only when operations exceed these durations (ms). */
export const HealthThresholds = {
  apiMs: 5000,
  heavyPageMs: 10000,
  gradeFlowMs: 20000,
  uiStuckMs: 30000,
}

/**
 * App health / lifecycle (INFO). Quiet expected paths should not call this in a loop.
 */
export function reportHealth(event, attrs = {}) {
  logInfo(event, {
    "telemetry.kind": "health",
    ...attrs,
  })
}

/**
 * Slow operation (WARN). No-op when under threshold.
 */
export function reportSlowOperation(name, durationMs, attrs = {}, thresholdMs = HealthThresholds.apiMs) {
  const duration = Number(durationMs)
  if (!name || Number.isNaN(duration) || duration < thresholdMs) {
    return false
  }
  logWarn(HealthEvent.PERF_SLOW, {
    "telemetry.kind": "perf",
    "perf.name": String(name),
    "perf.duration_ms": Math.round(duration),
    "perf.threshold_ms": thresholdMs,
    ...attrs,
  })
  return true
}

/**
 * UI may be stuck (WARN). Call once per watchdog fire.
 */
export function reportUiStuck(action, durationMs, attrs = {}) {
  logWarn(HealthEvent.UI_STUCK, {
    "telemetry.kind": "stuckness",
    "ui.action": String(action || "unknown"),
    "ui.duration_ms": Math.round(Number(durationMs) || 0),
    ...attrs,
  })
}

/**
 * Time an async fn; emit perf.slow_operation only if over threshold.
 * Failures rethrow — pair with existing error handlers.
 */
export async function trackAsync(name, fn, { thresholdMs = HealthThresholds.apiMs, attrs = {} } = {}) {
  const started = typeof performance !== "undefined" ? performance.now() : Date.now()
  try {
    return await fn()
  } finally {
    const ended = typeof performance !== "undefined" ? performance.now() : Date.now()
    reportSlowOperation(name, ended - started, attrs, thresholdMs)
  }
}

/**
 * Fires ui.stuck once if `action` stays active past timeout.
 * @returns {{ clear: () => void }}
 */
export function watchUiStuck(action, timeoutMs = HealthThresholds.uiStuckMs, attrs = {}) {
  const started = Date.now()
  let fired = false
  const timer = setTimeout(() => {
    if (fired) return
    fired = true
    reportUiStuck(action, Date.now() - started, attrs)
  }, timeoutMs)

  return {
    clear() {
      clearTimeout(timer)
    },
  }
}

/** Path-only URL for telemetry (strip query that may contain email). */
export function sanitizeHttpUrl(absolute) {
  try {
    if (/^https?:\/\//i.test(absolute)) {
      const parsed = new URL(absolute)
      return parsed.pathname
    }
  } catch {
    // fall through
  }
  return String(absolute || "").split("?")[0]
}

/** Mark request start for slow-API detection (axios config parity). */
export function markAxiosRequestStart(config) {
  if (!config) return config
  config._telemetryStartedAt = Date.now()
  return config
}

/** On axios settle: warn only when slow; skip OTEL ingest URLs. */
export function reportAxiosDuration(config, { ok = true } = {}) {
  if (!config?._telemetryStartedAt) return
  const url = config.url || ""
  const base = config.baseURL || ""
  const absolute =
    /^https?:\/\//i.test(url) || !base
      ? url
      : `${String(base).replace(/\/$/, "")}/${String(url).replace(/^\//, "")}`
  if (isErrorLoggingIngestUrl(absolute)) return

  const duration = Date.now() - config._telemetryStartedAt
  const method = (config.method || "GET").toUpperCase()
  const path = sanitizeHttpUrl(absolute)

  reportSlowOperation(
    `api.${method}`,
    duration,
    {
      "http.method": method,
      "http.route": path,
      "http.ok": ok === true,
    },
    HealthThresholds.apiMs,
  )
}
