import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../../../cms-csrftoken"
import { admin_dashbaord_base_url } from "../../../../compugrade-constants"
import { mapApiErrorsToStudentFields } from "../utils/studentFormValidation"

async function studioJsonHeaders() {
  const token = await fetchCsrfToken()
  return {
    "Content-Type": "application/json",
    "X-CSRFToken": token,
  }
}

async function readErrorPayload(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Update student profile fields (no password).
 * PUT /myplugin/classrooms/<classroom_id>/students/<student_id>/update/
 */
export async function updateClassroomStudent({
  classroomId,
  studentId,
  username,
  firstName,
  lastName,
  email,
}) {
  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classroomId}/students/${studentId}/update/`,
    {
      method: "PUT",
      credentials: "include",
      headers: await studioJsonHeaders(),
      body: JSON.stringify({
        username: String(username || "").trim(),
        first_name: String(firstName || "").trim(),
        last_name: String(lastName || "").trim(),
        email: String(email || "").trim(),
      }),
    },
  )

  if (!res.ok) {
    const payload = await readErrorPayload(res)
    const fieldErrors = mapApiErrorsToStudentFields(
      payload,
      `Unable to update student (${res.status}).`,
    )
    const error = new Error(fieldErrors.form || "Unable to update student.")
    error.fieldErrors = fieldErrors
    error.status = res.status
    throw error
  }

  return res.json().catch(() => ({}))
}

/**
 * Teacher reset student password via admin dashboard API.
 * POST {admin_dashbaord_base_url}/api/admin/password-reset/teacher
 */
export async function resetStudentPasswordByTeacher({
  teacherEmail,
  studentEmail,
  newPassword,
  confirmPassword,
  sendEmail = true,
}) {
  const res = await fetch(`${admin_dashbaord_base_url}/api/admin/password-reset/teacher`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teacher_email: String(teacherEmail || "").trim(),
      email: String(studentEmail || "").trim(),
      new_password: String(newPassword || ""),
      confirm_password: String(confirmPassword || ""),
      send_email: Boolean(sendEmail),
    }),
  })

  if (!res.ok) {
    const payload = await readErrorPayload(res)
    const fieldErrors = mapApiErrorsToStudentFields(
      payload,
      `Unable to reset password (${res.status}).`,
    )
    const error = new Error(fieldErrors.form || "Unable to reset password.")
    error.fieldErrors = fieldErrors
    error.status = res.status
    throw error
  }

  return res.json().catch(() => ({}))
}
