import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../../../cms-csrftoken"
import * as classroomApi from "../../manage-classes/services/classroomApi"

async function jsonHeaders() {
  const token = await fetchCsrfToken()
  return {
    "Content-Type": "application/json",
    "X-CSRFToken": token,
  }
}

export async function fetchClassrooms() {
  return classroomApi.fetchClassrooms()
}

export async function fetchStudentsForClass(classId) {
  return classroomApi.fetchStudentsList(classId)
}

export async function fetchCourseIntegration(courseKey) {
  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/course-integration/?course_key=${encodeURIComponent(courseKey)}`,
    {
      method: "GET",
      credentials: "include",
    }
  )
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}

export async function updateLessonExpanded(lessonId, courseKey, isExpanded) {
  const res = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/course-integration/`, {
    method: "PUT",
    credentials: "include",
    headers: await jsonHeaders(),
    body: JSON.stringify({
      lesson_id: lessonId,
      course_key: courseKey,
      is_expanded: isExpanded,
    }),
  })
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}
