import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../../../cms-csrftoken"

async function jsonHeaders() {
  const token = await fetchCsrfToken()
  return {
    "Content-Type": "application/json",
    "X-CSRFToken": token,
  }
}

function normalizeTeachersList(data) {
  if (Array.isArray(data)) return data
  return data?.teachers ?? data?.results ?? data?.all_teachers ?? []
}

export async function fetchSchoolTeachers() {
  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/teacher/school/`, {
    method: "GET",
    credentials: "include",
    headers: await jsonHeaders(),
  })
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  const data = await res.json()
  return normalizeTeachersList(data)
}

export async function fetchTeachers() {
  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/teachers/`, {
    method: "GET",
    credentials: "include",
    headers: await jsonHeaders(),
  })
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  const data = await res.json()
  return normalizeTeachersList(data)
}

export async function postClassroomTeachers(classId, emails) {
  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/teachers/`,
    {
      method: "POST",
      credentials: "include",
      headers: await jsonHeaders(),
      body: JSON.stringify({ emails }),
    }
  )
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}
