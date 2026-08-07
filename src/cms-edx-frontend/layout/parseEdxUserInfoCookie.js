function readCookie(name) {
  if (typeof document === "undefined") return null
  const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`))
  if (!match) return null
  try {
    // Keep literal "+" (valid in emails). Do not treat "+" as a space.
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

function normalizeEdxUserInfoString(raw) {
  let s = raw.trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1)
  }
  s = s.replace(/\\054/g, ",").replace(/\\u002c/gi, ",")
  s = s.replace(/\\"/g, '"')
  return s
}

export function parseEdxUserInfoCookie() {
  const raw = readCookie("edx-user-info")
  if (!raw) return null
  const candidates = [raw, normalizeEdxUserInfoString(raw)]
  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c)
      if (parsed && typeof parsed === "object") return parsed
    } catch {
      /* try next */
    }
  }
  return null
}

/**
 * Prefer first_name from edx-user-info cookie; fall back to given_name / name / username.
 */
export function getEdxUserFirstName(user, fallback = "User") {
  if (!user || typeof user !== "object") return fallback

  const firstName = user.first_name || user.firstName || user.given_name || user.givenName
  if (typeof firstName === "string" && firstName.trim()) {
    return firstName.trim()
  }

  const full = user.name || user.full_name || user.fullName
  if (typeof full === "string" && full.trim()) {
    const firstToken = full.trim().split(/\s+/).filter(Boolean)[0]
    if (firstToken) return firstToken
  }

  if (typeof user.username === "string" && user.username.trim()) {
    return user.username.trim()
  }

  return fallback
}

function splitNameLikeTokens(value) {
  if (!value || typeof value !== "string") return []
  return value
    .trim()
    .split(/[.\s_-]+/)
    .map((t) => t.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean)
}

/**
 * First letter of first name + first letter of last name when possible.
 * Uses full name from cookie if present, else email local-part tokens, else username tokens.
 */
export function getEdxUserInitials(user) {
  if (!user || typeof user !== "object") return "?"
  const full = user.name || user.full_name || user.fullName
  if (typeof full === "string" && full.trim()) {
    const parts = full.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      const a = parts[0][0]
      const b = parts[parts.length - 1][0]
      return `${a}${b}`.toUpperCase()
    }
    if (parts.length === 1) {
      const p = parts[0]
      if (p.length >= 2) return `${p[0]}${p[1]}`.toUpperCase()
      return p[0].toUpperCase()
    }
  }
  const email = user.email
  if (typeof email === "string" && email.includes("@")) {
    const local = email.split("@")[0]
    const tokens = splitNameLikeTokens(local)
    if (tokens.length >= 2) {
      const a = tokens[0][0]
      const b = tokens[tokens.length - 1][0]
      return `${a}${b}`.toUpperCase()
    }
    if (tokens.length === 1 && tokens[0].length >= 2) {
      return `${tokens[0][0]}${tokens[0][1]}`.toUpperCase()
    }
  }
  const username = user.username
  if (typeof username === "string" && username.trim()) {
    const tokens = splitNameLikeTokens(username)
    if (tokens.length >= 2) {
      const a = tokens[0][0]
      const b = tokens[tokens.length - 1][0]
      return `${a}${b}`.toUpperCase()
    }
    const u = username.trim()
    if (u.length >= 2) return `${u[0]}${u[1]}`.toUpperCase()
    return u[0].toUpperCase()
  }
  return "?"
}
