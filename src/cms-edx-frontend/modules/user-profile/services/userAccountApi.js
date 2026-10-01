import { getConfig } from "@edx/frontend-platform"
import { parseEdxUserInfoCookie } from "../../../layout/parseEdxUserInfoCookie"

function getLmsBaseUrl() {
  return String(getConfig().LMS_BASE_URL || "").replace(/\/$/, "")
}

async function readJsonOrThrow(res, fallbackMessage) {
  if (res.ok) {
    return res.json()
  }
  const text = await res.text().catch(() => "")
  throw new Error(text || fallbackMessage || `Request failed (${res.status})`)
}

/**
 * Fetch the authenticated user's LMS account profile.
 *
 * Open edX registers detail as:
 *   GET /api/user/v1/accounts/{username}   (no trailing slash)
 * and list as:
 *   GET /api/user/v1/accounts?username={username}
 */
export async function fetchUserAccount(username) {
  const resolvedUsername = String(username || "").trim()
  if (!resolvedUsername) {
    throw new Error("Username is required to load account profile.")
  }

  const base = getLmsBaseUrl()
  if (!base) {
    throw new Error("LMS_BASE_URL is not configured.")
  }

  const headers = { Accept: "application/json" }
  const encoded = encodeURIComponent(resolvedUsername)

  // Prefer detail route without trailing slash (matches Open edX URLConf).
  const detailUrl = `${base}/api/user/v1/accounts/${encoded}`
  let res = await fetch(detailUrl, {
    method: "GET",
    credentials: "include",
    headers,
  })

  if (res.ok) {
    return res.json()
  }

  // Fallback: list endpoint with username query (also valid in Open edX).
  if (res.status === 404) {
    const listUrl = `${base}/api/user/v1/accounts?username=${encoded}`
    res = await fetch(listUrl, {
      method: "GET",
      credentials: "include",
      headers,
    })
    const data = await readJsonOrThrow(res, `Failed to load account profile (${res.status})`)
    if (Array.isArray(data)) {
      if (!data.length) {
        throw new Error("Account profile not found.")
      }
      return data[0]
    }
    return data
  }

  return readJsonOrThrow(res, `Failed to load account profile (${res.status})`)
}

export function resolveUsernameFromSession() {
  const cookieUser = parseEdxUserInfoCookie()
  return String(cookieUser?.username || "").trim()
}

/**
 * Prefer first_name; else first token of full name; else username.
 */
export function normalizeUserAccount(payload, cookieUser = null) {
  const body = payload && typeof payload === "object" ? payload : {}
  const cookie = cookieUser && typeof cookieUser === "object" ? cookieUser : {}

  const username = String(body.username || cookie.username || "").trim()
  const email = String(body.email || cookie.email || "").trim()
  const fullName = String(body.name || body.full_name || cookie.name || "").trim()

  const explicitFirst = String(
    body.first_name || body.firstName || body.given_name || body.givenName || ""
  ).trim()

  let firstName = explicitFirst
  if (!firstName && fullName) {
    firstName = fullName.split(/\s+/).filter(Boolean)[0] || ""
  }
  if (!firstName) {
    firstName = username
  }

  return {
    username,
    email,
    fullName,
    firstName,
    raw: body,
  }
}
