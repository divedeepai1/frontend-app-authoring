import { LoggerProvider, BatchLogRecordProcessor } from "@opentelemetry/sdk-logs"
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http"
import { logs } from "@opentelemetry/api-logs"
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { resourceFromAttributes } from "@opentelemetry/resources"
import {
  ATTR_SERVICE_NAME,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from "@opentelemetry/semantic-conventions"
import { getErrorLoggingConfig } from "./config"
import { ContextAttributesProcessor } from "./contextAttributes"
import { recordBootstrapSpan } from "./tracer"

let initialized = false
let loggerProviderRef = null
let tracerProviderRef = null

// Prefer modern attr constant when present; older semconv uses SEMRESATTRS_*.
const DEPLOYMENT_ENVIRONMENT_ATTR =
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT || "deployment.environment"

function buildResource(config) {
  return resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.serviceName,
    // New OTel name + legacy key — SigNoz Logs env filter still indexes deployment.environment.
    [DEPLOYMENT_ENVIRONMENT_ATTR]: config.environment,
    "deployment.environment": config.environment,
  })
}

/**
 * Sets up OTLP logs + traces export to SigNoz (via same-origin /otel proxy).
 * @returns {boolean} whether export is active
 */
export function initInstrumentation() {
  if (initialized) {
    return true
  }

  const config = getErrorLoggingConfig()
  if (!config.enabled) {
    return false
  }

  try {
    const resource = buildResource(config)

    const logExporter = new OTLPLogExporter({
      url: config.logsUrl,
      headers: config.headers,
    })
    const loggerProvider = new LoggerProvider({
      resource,
      processors: [
        new ContextAttributesProcessor(),
        // sdk-logs v3+ takes { exporter }, not a positional exporter arg
        new BatchLogRecordProcessor({ exporter: logExporter }),
      ],
    })
    logs.setGlobalLoggerProvider(loggerProvider)
    loggerProviderRef = loggerProvider

    const traceExporter = new OTLPTraceExporter({
      url: config.tracesUrl,
      headers: config.headers,
    })
    const tracerProvider = new WebTracerProvider({
      resource,
      spanProcessors: [new BatchSpanProcessor(traceExporter)],
    })
    tracerProvider.register()
    tracerProviderRef = tracerProvider

    initialized = true
    installFlushOnUnload()
    // Registers the service in SigNoz Services before any error fires.
    recordBootstrapSpan()
    return true
  } catch (err) {
    console.error("Failed to initialize SigNoz error logging:", err)
    return false
  }
}

function installFlushOnUnload() {
  if (typeof window === "undefined") {
    return
  }
  const flush = () => {
    try {
      loggerProviderRef?.forceFlush?.()
    } catch {
      // ignore
    }
    try {
      tracerProviderRef?.forceFlush?.()
    } catch {
      // ignore
    }
  }
  window.addEventListener("pagehide", flush)
  window.addEventListener("beforeunload", flush)
}

export function isErrorLoggingInitialized() {
  return initialized
}
