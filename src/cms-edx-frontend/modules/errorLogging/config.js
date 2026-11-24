/**
 * SigNoz / OTEL env from dotenv-webpack (browser-safe values only).
 *
 * Browser never talks to SigNoz directly (collector has no CORS).
 * Logs go same-origin → /otel/v1/logs → webpack/nginx proxy → otel.compugrade.com.
 */

export function getErrorLoggingConfig() {
  const enabled =
    process.env.SIGNOZ_ERROR_LOGGING === "true" || process.env.SIGNOZ_ERROR_LOGGING === true
  const proxyPath = normalizeProxyPath(process.env.SIGNOZ_OTLP_PROXY_PATH || "/otel")
  const serviceName = (process.env.OTEL_SERVICE_NAME || "lms-frontend").trim()
  const environment = (process.env.OTEL_DEPLOYMENT_ENVIRONMENT || "development").trim()

  const origin =
    typeof window !== "undefined" && window.location?.origin ? window.location.origin : ""
  const logsUrl = enabled ? `${origin}${proxyPath}/v1/logs` : ""
  const tracesUrl = enabled ? `${origin}${proxyPath}/v1/traces` : ""

  return {
    enabled,
    proxyPath,
    logsUrl,
    tracesUrl,
    serviceName,
    environment,
    // Auth is injected by the proxy — do not send SigNoz bearer tokens from the browser.
    headers: {},
  }
}

function normalizeProxyPath(raw) {
  const trimmed = String(raw || "/otel").trim() || "/otel"
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return withSlash.replace(/\/$/, "")
}

/** True when a URL is our OTEL proxy (skip logging those failures to avoid loops). */
export function isErrorLoggingIngestUrl(url) {
  if (!url) return false
  const absolute = String(url)
  const { proxyPath, logsUrl, tracesUrl } = getErrorLoggingConfig()
  if (logsUrl && absolute.includes(logsUrl)) return true
  if (tracesUrl && absolute.includes(tracesUrl)) return true
  if (
    proxyPath &&
    (absolute.includes(`${proxyPath}/v1/logs`) || absolute.includes(`${proxyPath}/v1/traces`))
  ) {
    return true
  }
  return absolute.includes("/otel/v1/logs") || absolute.includes("/otel/v1/traces")
}
