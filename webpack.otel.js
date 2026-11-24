/**
 * Shared SigNoz / OTEL helpers for webpack (dev proxy + DefinePlugin).
 * Auth headers stay server-side only — never injected into the browser bundle.
 */

const webpack = require("webpack")

/** Parses `Key=Value,Key2=Value2` (URL-encoded values) for the OTEL proxy only. */
function parseOtlpHeaders(raw) {
  const headers = {}
  if (!raw || typeof raw !== "string") return headers
  raw.split(",").forEach((pair) => {
    const trimmed = pair.trim()
    if (!trimmed) return
    const eq = trimmed.indexOf("=")
    if (eq <= 0) return
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!key) return
    try {
      headers[key] = decodeURIComponent(value)
    } catch {
      headers[key] = value
    }
  })
  return headers
}

function getSignozBuildConfig() {
  const endpoint = (process.env.SIGNOZ_OTLP_ENDPOINT || "").trim().replace(/\/$/, "")
  const proxyPath =
    (process.env.SIGNOZ_OTLP_PROXY_PATH || "/otel").replace(/\/$/, "") || "/otel"
  const enabled = Boolean(endpoint) || process.env.SIGNOZ_ERROR_LOGGING === "true"
  const serviceName = (process.env.OTEL_SERVICE_NAME || "lms-frontend").trim()
  const environment = (process.env.OTEL_DEPLOYMENT_ENVIRONMENT || "development").trim()
  const proxyHeaders = parseOtlpHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS || "")

  return {
    endpoint,
    proxyPath,
    enabled,
    serviceName,
    environment,
    proxyHeaders,
  }
}

/**
 * Inject browser-safe OTEL flags. Does NOT inject collector auth tokens.
 */
function createSignozDefinePlugin() {
  const cfg = getSignozBuildConfig()
  return new webpack.DefinePlugin({
    "process.env.SIGNOZ_ERROR_LOGGING": JSON.stringify(cfg.enabled ? "true" : "false"),
    "process.env.SIGNOZ_OTLP_PROXY_PATH": JSON.stringify(cfg.proxyPath),
    "process.env.OTEL_SERVICE_NAME": JSON.stringify(cfg.serviceName),
    "process.env.OTEL_DEPLOYMENT_ENVIRONMENT": JSON.stringify(cfg.environment),
  })
}

/**
 * webpack-dev-server proxy entry for same-origin /otel → collector.
 */
function createSignozDevProxy() {
  const cfg = getSignozBuildConfig()
  if (!cfg.endpoint) return null
  return {
    context: [cfg.proxyPath],
    target: cfg.endpoint,
    pathRewrite: { [`^${cfg.proxyPath}`]: "" },
    changeOrigin: true,
    secure: true,
    headers: cfg.proxyHeaders,
  }
}

/**
 * Mutate a frontend-build webpack config in place.
 */
function applySignozWebpackConfig(config, { withDevProxy = false } = {}) {
  if (!config.plugins) config.plugins = []
  config.plugins.push(createSignozDefinePlugin())

  if (withDevProxy) {
    const proxyEntry = createSignozDevProxy()
    if (proxyEntry) {
      if (!config.devServer) config.devServer = {}
      const existing = config.devServer.proxy
      if (Array.isArray(existing)) {
        config.devServer.proxy = [...existing, proxyEntry]
      } else if (existing && typeof existing === "object") {
        config.devServer.proxy = [existing, proxyEntry]
      } else {
        config.devServer.proxy = [proxyEntry]
      }
    }
  }

  return config
}

module.exports = {
  parseOtlpHeaders,
  getSignozBuildConfig,
  createSignozDefinePlugin,
  createSignozDevProxy,
  applySignozWebpackConfig,
}
