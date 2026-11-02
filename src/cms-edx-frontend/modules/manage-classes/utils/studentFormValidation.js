const NAME_PATTERN = /^[a-zA-Z\s]*$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isAllowedNameInput(value) {
  return NAME_PATTERN.test(String(value ?? ""))
}

export function validateStudentInfoFields({ username, firstName, lastName, email }) {
  const errors = {}
  const trimmedUsername = String(username || "").trim()
  const trimmedFirst = String(firstName || "").trim()
  const trimmedLast = String(lastName || "").trim()
  const trimmedEmail = String(email || "").trim()

  if (!trimmedUsername) {
    errors.username = "Username is required."
  }
  if (!trimmedFirst) {
    errors.firstName = "First name is required."
  } else if (!isAllowedNameInput(trimmedFirst)) {
    errors.firstName = "First name can only contain letters and spaces."
  }
  if (!trimmedLast) {
    errors.lastName = "Last name is required."
  } else if (!isAllowedNameInput(trimmedLast)) {
    errors.lastName = "Last name can only contain letters and spaces."
  }
  if (!trimmedEmail) {
    errors.email = "Email address is required."
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Enter a valid email address."
  }

  return errors
}

export function validateStudentPasswordFields({ newPassword, confirmPassword }) {
  const errors = {}
  const password = String(newPassword || "")
  const confirm = String(confirmPassword || "")

  if (!password.trim()) {
    errors.newPassword = "New password is required."
  }
  if (!confirm.trim()) {
    errors.confirmPassword = "Confirm password is required."
  } else if (password !== confirm) {
    errors.confirmPassword = "Passwords do not match."
  }

  return errors
}

/**
 * Map API error payload into form field keys used by the edit modal.
 * Falls back to { form: message } for non-field errors.
 */
export function mapApiErrorsToStudentFields(payload, fallback = "Something went wrong. Please try again.") {
  if (!payload) {
    return { form: fallback }
  }

  let data = payload
  if (typeof payload === "string") {
    const trimmed = payload.trim()
    if (!trimmed) return { form: fallback }
    try {
      data = JSON.parse(trimmed)
    } catch {
      return { form: trimmed }
    }
  }

  if (typeof data !== "object" || data === null) {
    return { form: fallback }
  }

  const fieldMap = {
    username: "username",
    first_name: "firstName",
    firstName: "firstName",
    last_name: "lastName",
    lastName: "lastName",
    email: "email",
    new_password: "newPassword",
    newPassword: "newPassword",
    confirm_password: "confirmPassword",
    confirmPassword: "confirmPassword",
    password: "newPassword",
    send_email: "sendEmail",
    teacher_email: "form",
  }

  const errors = {}
  const source =
    data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)
      ? data.errors
      : data

  Object.entries(source).forEach(([key, value]) => {
    if (["error", "message", "detail", "non_field_errors"].includes(key)) return
    const formKey = fieldMap[key]
    if (!formKey) return
    const messages = Array.isArray(value) ? value : [value]
    const text = messages
      .map((item) => (item != null ? String(item).trim() : ""))
      .filter(Boolean)
      .join(" ")
    if (text) {
      errors[formKey] = text
    }
  })

  if (Object.keys(errors).length) {
    return errors
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return { form: data.error.trim() }
  }
  if (typeof data.message === "string" && data.message.trim()) {
    return { form: data.message.trim() }
  }
  if (typeof data.detail === "string" && data.detail.trim()) {
    return { form: data.detail.trim() }
  }
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    return { form: data.non_field_errors.map(String).join(" ") }
  }

  return { form: fallback }
}
