import { base_url } from "../../../../compugrade-constants"

async function postJson(path, body) {
  const res = await fetch(`${base_url}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let message = String(res.status)
    try {
      const data = await res.json()
      message =
        (typeof data?.detail === "string" && data.detail) ||
        (typeof data?.message === "string" && data.message) ||
        message
    } catch {
      try {
        message = (await res.text()) || message
      } catch {
        // keep status fallback
      }
    }
    throw new Error(message)
  }
  return res.json()
}

export async function getCourseDisableByDefault(courseId) {
  if (!courseId) throw new Error("course_id is required.")
  return postJson("/api/lms/get_course_disable_by_default", {
    course_id: String(courseId),
  })
}

export async function setCourseDisableByDefault(courseId, disableByDefault) {
  if (!courseId) throw new Error("course_id is required.")
  return postJson("/api/lms/set_course_disable_by_default", {
    course_id: String(courseId),
    disable_by_default: Boolean(disableByDefault),
  })
}

export function parseDisableByDefault(data) {
  if (typeof data?.disable_by_default === "boolean") return data.disable_by_default
  return Boolean(data?.disable_by_default)
}
