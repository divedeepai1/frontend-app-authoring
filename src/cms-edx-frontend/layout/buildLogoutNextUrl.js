import { admin_dashbaord_base_url } from "../../compugrade-constants"

/**
 * Logout `next` destination: dashboard teacher-login for the same env as
 * admin_dashbaord_base_url (staging → staging.dashboard…; otherwise production).
 * Does not use CMS_HOST.
 */
export function getLogoutNextDestination() {
  const raw = typeof admin_dashbaord_base_url === "string" ? admin_dashbaord_base_url.trim() : ""
  if (!raw) return null

  try {
    const api = new URL(raw.includes("://") ? raw : `https://${raw}`)
    const isStaging = /staging/i.test(api.hostname)
    const host = isStaging
      ? "staging.dashboard.compugrade.com"
      : "production.dashboard.compugrade.com"
    return `${api.protocol}//${host}/teacher-login/`
  } catch {
    return null
  }
}

export function appendNextToLogoutUrl(logoutHref, nextHref) {
  if (!logoutHref || !nextHref) return logoutHref
  try {
    const u = new URL(logoutHref, typeof window !== "undefined" ? window.location.href : undefined)
    u.searchParams.set("next", nextHref)
    return u.toString()
  } catch {
    const sep = logoutHref.includes("?") ? "&" : "?"
    return `${logoutHref}${sep}next=${encodeURIComponent(nextHref)}`
  }
}
