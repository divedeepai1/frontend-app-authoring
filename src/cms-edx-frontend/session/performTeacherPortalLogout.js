import { appendNextToLogoutUrl, getLogoutNextDestination } from "../layout/buildLogoutNextUrl"
import { parseEdxUserInfoCookie } from "../layout/parseEdxUserInfoCookie"

/**
 * Builds the same logout URL used by the top-bar "Log out" action.
 * @returns {string|null}
 */
export function getTeacherPortalLogoutHref() {
  const user = parseEdxUserInfoCookie()
  const base = user?.header_urls?.logout
  if (!base || typeof base !== "string") return null

  const nextDest = getLogoutNextDestination()
  return nextDest ? appendNextToLogoutUrl(base, nextDest) : base
}

/**
 * Navigates to the portal logout endpoint (same flow as header dropdown).
 * @returns {boolean} true if navigation was triggered
 */
export function performTeacherPortalLogout() {
  if (typeof window === "undefined") return false
  const href = getTeacherPortalLogoutHref()
  if (!href) return false
  window.location.assign(href)
  return true
}
