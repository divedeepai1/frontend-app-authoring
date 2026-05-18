import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../../../cms-csrftoken"

async function jsonHeaders() {
  const token = await fetchCsrfToken()
  return {
    "Content-Type": "application/json",
    "X-CSRFToken": token,
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

export async function saveClassroom({ name, grade, period }, existingClassId) {
  const base = `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/`
  const url = existingClassId ? `${base}${existingClassId}/` : base
  const res = await fetch(url, {
    method: existingClassId ? "PUT" : "POST",
    credentials: "include",
    headers: await jsonHeaders(),
    body: JSON.stringify({ name, grade, period }),
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
