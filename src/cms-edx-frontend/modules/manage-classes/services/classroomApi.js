import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../../../cms-csrftoken"
import { classroom_archive_password } from "../../../../compugrade-constants"

async function jsonHeaders() {
  const token = await fetchCsrfToken()
  return {
    "Content-Type": "application/json",
    "X-CSRFToken": token,
  }
}

async function archiveActionHeaders() {
  const headers = await jsonHeaders()
  return {
    ...headers,
    password: classroom_archive_password,
  }
}

export async function fetchCoursesList() {
  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/courses/`, {
    method: "GET",
    credentials: "include",
    headers: await jsonHeaders(),
  })
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}

const normalizeOptionalClassNumber = (value) => {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export async function saveClassroom({ name, grade, period }, existingClassId) {
  const base = `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/`
  const url = existingClassId ? `${base}${existingClassId}/` : base
  const res = await fetch(url, {
    method: existingClassId ? "PUT" : "POST",
    credentials: "include",
    headers: await jsonHeaders(),
    body: JSON.stringify({
      name,
      grade: normalizeOptionalClassNumber(grade),
      period: normalizeOptionalClassNumber(period),
    }),
  })
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}

export async function postClassroomCourses(classId, courseIds) {
  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/courses/`,
    {
      method: "POST",
      credentials: "include",
      headers: await jsonHeaders(),
      body: JSON.stringify({ courses: courseIds }),
    }
  )
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}

export async function putClassroomPreferences(classId, preferences) {
  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/`, {
    method: "PUT",
    credentials: "include",
    headers: await jsonHeaders(),
    body: JSON.stringify({ preferences }),
  })
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}

export async function postClassroomAnnouncement(classId, announcement) {
  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/announcements/`,
    {
      method: "POST",
      credentials: "include",
      headers: await jsonHeaders(),
      body: JSON.stringify({ announcement }),
    }
  )
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}

export async function fetchStudentsList(classId) {
  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/students-list/`,
    {
      method: "GET",
      credentials: "include",
      headers: await jsonHeaders(),
    }
  )
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}

export async function removeStudentsFromClassroom(classId, studentIds) {
  const students = (Array.isArray(studentIds) ? studentIds : [studentIds])
    .map((id) => id)
    .filter((id) => id !== undefined && id !== null && id !== "")

  if (!students.length) {
    throw new Error("No students selected for removal.")
  }

  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/students/`,
    {
      method: "DELETE",
      credentials: "include",
      headers: await jsonHeaders(),
      body: JSON.stringify({ students }),
    }
  )
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json().catch(() => ({}))
}

export async function fetchClassrooms() {
  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/`, {
    method: "GET",
    credentials: "include",
    headers: await jsonHeaders(),
  })
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}

export async function deleteClassroom(classId) {
  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/`, {
    method: "DELETE",
    credentials: "include",
    headers: await jsonHeaders(),
  })
  if (!res.ok) throw new Error(await res.text() || String(res.status))
}

export async function archiveClassroom(classId) {
  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/archive/`,
    {
      method: "GET",
      credentials: "include",
      headers: await archiveActionHeaders(),
    }
  )
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json().catch(() => ({}))
}

export async function unarchiveClassroom(classId) {
  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/archive/`,
    {
      method: "DELETE",
      credentials: "include",
      headers: await archiveActionHeaders(),
    }
  )
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json().catch(() => ({}))
}
