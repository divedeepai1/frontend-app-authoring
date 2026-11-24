import { initInstrumentation, isErrorLoggingInitialized } from "./instrumentation"
import { installGlobalErrorHandlers, reportReactError } from "./errorTracking"
import { installFetchErrorLogging, reportAxiosError, reportNetworkError } from "./networkErrors"
import { logError, logWarn, logInfo } from "./logger"
import { getErrorLoggingConfig } from "./config"
import {
  HealthEvent,
  HealthThresholds,
  reportHealth,
  reportSlowOperation,
  reportUiStuck,
  trackAsync,
  watchUiStuck,
  markAxiosRequestStart,
  reportAxiosDuration,
} from "./healthTelemetry"
import { syncTelemetryUserId, clearTelemetryUserId } from "./sessionUser"

/**
 * Boot SigNoz front-end logging (errors + health/perf helpers). Idempotent.
 */
export function initErrorLogging() {
  const active = initInstrumentation()
  if (!active) {
    return false
  }
  installGlobalErrorHandlers()
  installFetchErrorLogging()
  reportHealth(HealthEvent.TELEMETRY_READY, {
    "otel.service": getErrorLoggingConfig().serviceName,
    "deployment.environment": getErrorLoggingConfig().environment,
  })
  return true
}

export {
  logError,
  logWarn,
  logInfo,
  reportReactError,
  reportAxiosError,
  reportNetworkError,
  isErrorLoggingInitialized,
  getErrorLoggingConfig,
  HealthEvent,
  HealthThresholds,
  reportHealth,
  reportSlowOperation,
  reportUiStuck,
  trackAsync,
  watchUiStuck,
  markAxiosRequestStart,
  reportAxiosDuration,
  syncTelemetryUserId,
  clearTelemetryUserId,
}
