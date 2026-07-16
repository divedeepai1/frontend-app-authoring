export const PASSWORD_HINT =
  "Password must be at least 8 characters and include uppercase, lowercase, and a number."

export const PASSWORD_MIN_LENGTH = 8

export const PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$"

export function applyPasswordFormValidity(formEl, values) {
  if (!formEl) return

  const newPassword = formEl.elements.namedItem("newPassword")
  const confirmPassword = formEl.elements.namedItem("confirmPassword")

  if (newPassword) {
    if (values.newPassword && values.oldPassword === values.newPassword) {
      newPassword.setCustomValidity("New password must be different from your current password.")
    } else {
      newPassword.setCustomValidity("")
    }
  }

  if (confirmPassword) {
    if (values.confirmPassword && values.newPassword !== values.confirmPassword) {
      confirmPassword.setCustomValidity("New password and confirmation do not match.")
    } else {
      confirmPassword.setCustomValidity("")
    }
  }
}

export function applyEmailFormValidity(formEl, values, currentEmail) {
  if (!formEl) return

  const newEmail = formEl.elements.namedItem("newEmail")
  const confirmEmail = formEl.elements.namedItem("confirmEmail")

  if (newEmail) {
    const nextEmail = String(values.newEmail || "").trim().toLowerCase()
    const current = String(currentEmail || "").trim().toLowerCase()
    if (nextEmail && current && nextEmail === current) {
      newEmail.setCustomValidity("New email must be different from your current email.")
    } else {
      newEmail.setCustomValidity("")
    }
  }

  if (confirmEmail) {
    const nextEmail = String(values.newEmail || "").trim()
    const confirm = String(values.confirmEmail || "").trim()
    if (confirm && nextEmail !== confirm) {
      confirmEmail.setCustomValidity("Email addresses do not match.")
    } else {
      confirmEmail.setCustomValidity("")
    }
  }
}

export function validatePassword(password) {
  if (!password || password.length < 8) return PASSWORD_HINT
  if (!/[A-Z]/.test(password)) return PASSWORD_HINT
  if (!/[a-z]/.test(password)) return PASSWORD_HINT
  if (!/[0-9]/.test(password)) return PASSWORD_HINT
  return null
}

export function validateEmail(email) {
  const trimmed = String(email || "").trim()
  if (!trimmed) return "Email is required."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email address."
  return null
}

export function validatePasswordChange({ oldPassword, newPassword, confirmPassword }) {
  if (!oldPassword?.trim()) return "Current password is required."
  const passwordError = validatePassword(newPassword)
  if (passwordError) return passwordError
  if (newPassword !== confirmPassword) return "New password and confirmation do not match."
  if (oldPassword === newPassword) return "New password must be different from your current password."
  return null
}

export function validateEmailChange({ oldPassword, newEmail, confirmEmail, currentEmail }) {
  if (!oldPassword?.trim()) return "Current password is required."
  const emailError = validateEmail(newEmail)
  if (emailError) return emailError
  if (String(newEmail).trim() !== String(confirmEmail).trim()) {
    return "Email addresses do not match."
  }
  if (
    currentEmail &&
    String(newEmail).trim().toLowerCase() === String(currentEmail).trim().toLowerCase()
  ) {
    return "New email must be different from your current email."
  }
  return null
}
