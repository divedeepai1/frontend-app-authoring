import {
  fetchUserAccount,
  resolveUsernameFromSession,
} from "../user-profile/services/userAccountApi"

const USER_ID_KEY = "user_id"

/**
 * Persist a non-PII identity for SigNoz `user.id`.
 * Loads numeric account id from LMS GET /api/user/v1/accounts/{username}.
 * Never stores username, email, or name.
 */
export async function syncTelemetryUserId() {
  try {
    const username = resolveUsernameFromSession()
    if (!username) return

    const account = await fetchUserAccount(username)
    const id = account?.id
    if (id == null || String(id).trim() === "") return

    sessionStorage.setItem(USER_ID_KEY, String(id).trim())
  } catch {
    // ignore — leave previous/anonymous user.id
  }
}

export function clearTelemetryUserId() {
  try {
    sessionStorage.removeItem(USER_ID_KEY)
  } catch {
    // ignore
  }
}
