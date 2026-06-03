import { getConfig } from "@edx/frontend-platform"

export function getLogoutNextDestination() {
  if (typeof window === "undefined") return null
  const cfg = getConfig() || {}
  const redirect_cms_host =
    (typeof cfg.CMS_HOST === "string" && cfg.CMS_HOST.trim()) ||
    (typeof cfg.STUDIO_BASE_URL === "string" && cfg.STUDIO_BASE_URL.trim()) ||
    ""
  return redirect_cms_host
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
