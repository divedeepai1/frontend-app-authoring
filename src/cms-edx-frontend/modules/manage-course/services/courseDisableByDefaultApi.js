import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../../../cms-csrftoken"

async function jsonHeaders() {
  const token = await fetchCsrfToken()
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-CSRFToken": token,
  }
}

async function readError(res) {
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
  return message
}

function toClassroomId(classroomId) {
  const parsed = Number(classroomId)
  if (!Number.isFinite(parsed)) {
    throw new Error("classroom_id is required.")
  }
  return parsed
}

export async function getCourseDisableByDefault(courseKey, classroomId) {
  if (!courseKey) throw new Error("course_key is required.")
  const classId = toClassroomId(classroomId)
  const params = new URLSearchParams({
    course_key: String(courseKey),
    classroom_id: String(classId),
  })

  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/course-integration/?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: await jsonHeaders(),
    }
  )
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function setCourseDisableByDefault(courseKey, classroomId, disableByDefault) {
  if (!courseKey) throw new Error("course_key is required.")
  const classId = toClassroomId(classroomId)

  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/course-integration/preferences/`,
    {
      method: "PUT",
      credentials: "include",
      headers: await jsonHeaders(),
      body: JSON.stringify({
        classroom_id: classId,
        course_key: String(courseKey),
        disable_by_default: Boolean(disableByDefault),
      }),
    }
  )
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export function parseDisableByDefault(data) {
  if (typeof data?.preferences?.disable_by_default === "boolean") {
    return data.preferences.disable_by_default
  }
  if (typeof data?.disable_by_default === "boolean") {
    return data.disable_by_default
  }
  return Boolean(data?.preferences?.disable_by_default ?? data?.disable_by_default)
}
