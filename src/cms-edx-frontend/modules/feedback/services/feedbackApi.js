import { admin_dashbaord_base_url } from "../../../../compugrade-constants"

const FEEDBACK_API_URL = `${admin_dashbaord_base_url}/api/feedbacks/`
const JWT_SIGNING_SECRET = "compugrade-feedback-jwt-secret"

function base64UrlEncode(input) {
  const bytes = typeof input === "string"
    ? new TextEncoder().encode(input)
    : input instanceof ArrayBuffer
      ? new Uint8Array(input)
      : new Uint8Array(input)

  let binary = ""
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function createRandomSignatureBytes() {
  const bytes = new Uint8Array(32)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
    return bytes
  }
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256)
  }
  return bytes
}

async function createJwtSignature(unsignedToken) {
  // crypto.subtle is unavailable on non-secure HTTP origins
  if (globalThis.crypto?.subtle?.importKey && globalThis.crypto?.subtle?.sign) {
    try {
      const key = await globalThis.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(JWT_SIGNING_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      )
      const signature = await globalThis.crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(unsignedToken),
      )
      return base64UrlEncode(signature)
    } catch {
      // fall through to random signature
    }
  }

  return base64UrlEncode(createRandomSignatureBytes())
}

async function generateJwtBearerToken() {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const now = Math.floor(Date.now() / 1000)
  const payload = base64UrlEncode(JSON.stringify({
    sub: "teacher",
    name: "Teacher",
    iat: now,
  }))

  const unsignedToken = `${header}.${payload}`
  const signature = await createJwtSignature(unsignedToken)
  return `${unsignedToken}.${signature}`
}

export async function submitFeedback({ userName, userEmail, messageType, message }) {
  const body = {
    user_name: String(userName || "").trim() || "Teacher",
    user_email: String(userEmail || "").trim(),
    user_type: "Teacher",
    message_type: String(messageType || "").trim().toLowerCase(),
    message: String(message || "").trim(),
  }

  if (!body.user_email) throw new Error("User email is required.")
  if (!body.message_type) throw new Error("Message type is required.")
  if (!body.message) throw new Error("Message is required.")

  const bearerToken = await generateJwtBearerToken()

  const res = await fetch(FEEDBACK_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    let detail = ""
    try {
      const data = JSON.parse(text)
      detail = data?.detail || data?.error || data?.message || ""
    } catch {
      detail = text
    }
    throw new Error(detail || `Failed to send feedback (${res.status}).`)
  }

  return res.json().catch(() => ({}))
}
