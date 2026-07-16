import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../../../cms-csrftoken"
import { readApiError } from "../utils/apiError"

async function jsonHeaders() {
  const token = await fetchCsrfToken()
  return {
    "Content-Type": "application/json",
    "X-CSRFToken": token,
  }
}

export async function changePassword({ oldPassword, newPassword, confirmPassword }) {
  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/teachers/change-password/`,
    {
      method: "PUT",
      credentials: "include",
      headers: await jsonHeaders(),
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    }
  )
  if (!res.ok) {
    throw new Error(
      await readApiError(res, "Unable to update password. Please try again.")
    )
  }
  return res.json().catch(() => ({}))
}

export async function changeEmail({ oldPassword, newEmail }) {
  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/teacher/change-email/`, {
    method: "PUT",
    credentials: "include",
    headers: await jsonHeaders(),
    body: JSON.stringify({
      old_password: oldPassword,
      new_email: newEmail.trim(),
    }),
  })
  if (!res.ok) {
    throw new Error(
      await readApiError(res, "Unable to update email. Please try again.")
    )
  }
  return res.json().catch(() => ({}))
}
