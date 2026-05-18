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

export async function fetchStudentStats(classId) {
  const response = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/classroom/${classId}/student-stats/`,
    {
      method: "GET",
      credentials: "include",
      headers: await jsonHeaders(),
    }
  )
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to load student stats.")
  }
  const result = await response.json()
  return {
    totalStudents: result.total_students || 0,
    studentsJoinedLastWeek: result.students_joined_last_week || 0,
  }
}

export function countActiveCourses(classrooms, classId) {
  const courseIds = new Set()
  const list = classId
    ? classrooms.filter((cls) => String(cls.id) === String(classId))
    : classrooms
  list.forEach((cls) => {
    ;(cls.courses || []).forEach((course) => {
      if (course?.id) courseIds.add(String(course.id))
    })
  })
  return courseIds.size
}

export async function fetchAggregatedStudentStats(classrooms) {
  if (!classrooms.length) {
    return { totalStudents: 0, studentsJoinedLastWeek: 0 }
  }
  const results = await Promise.all(
    classrooms.map((cls) =>
      fetchStudentStats(cls.id).catch(() => ({
        totalStudents: 0,
        studentsJoinedLastWeek: 0,
      }))
    )
  )
  return results.reduce(
    (acc, item) => ({
      totalStudents: acc.totalStudents + item.totalStudents,
      studentsJoinedLastWeek: acc.studentsJoinedLastWeek + item.studentsJoinedLastWeek,
    }),
    { totalStudents: 0, studentsJoinedLastWeek: 0 }
  )
}
