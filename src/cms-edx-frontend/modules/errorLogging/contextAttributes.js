/**
 * Attaches non-PII context to every exported log/span.
 * Prefer user.id + backend URL — never email/name/tokens.
 */

import { getConfig } from "@edx/frontend-platform"
import { base_url } from "../../../compugrade-constants"

function readSession(key) {
  try {
    return sessionStorage.getItem(key) || ""
  } catch {
    return ""
  }
}

function resolveBackendUrl() {
  try {
    const studio = String(getConfig()?.STUDIO_BASE_URL || "").trim()
    if (studio) return studio.replace(/\/$/, "")
  } catch {
    // getConfig may throw before platform init
  }
  return String(base_url || "").replace(/\/$/, "")
}

export function getContextAttributes() {
  const userId = readSession("user_id")
  const path =
    typeof window !== "undefined"
      ? `${window.location.pathname || ""}${window.location.search || ""}`
      : ""

  return {
    "user.id": userId || "anonymous",
    "backend.url": resolveBackendUrl(),
    "page.url": typeof window !== "undefined" ? window.location.href : "",
    "page.path": path || "/",
    "browser.user_agent": typeof navigator !== "undefined" ? navigator.userAgent : "",
  }
}

export class ContextAttributesProcessor {
  onEmit(logRecord) {
    logRecord.setAttributes(getContextAttributes())
  }

  forceFlush() {
    return Promise.resolve()
  }

  shutdown() {
    return Promise.resolve()
  }
}
