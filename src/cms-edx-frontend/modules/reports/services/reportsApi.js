import { base_url } from "../../../../compugrade-constants"
import * as classroomApi from "../../manage-classes/services/classroomApi"
import { fetchCourseIntegration } from "../../manage-course/services/curriculumApi"
import { REPORT_ENDPOINTS, REPORT_EXPORT_ENDPOINTS, REPORT_TYPES } from "../constants"
import {
  mapRubricsForReportRequest,
  mapStudentsForReportRequest,
  normalizeGradeReport,
  normalizeLessonActivityReport,
  normalizeOverdueLessonsReport,
} from "../utils/reportMappers"

export function normalizeStudentsList(result) {
  const students = Array.isArray(result?.students) ? result.students : []
  return students.map((student) => ({
    id: student.id,
    firstName: student.first_name || "",
    lastName: student.last_name || "",
    name:
      student.name ||
      student.full_name ||
      `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
      student.email ||
      `Student ${student.id}`,
    email: student.email || "",
  }))
}

export function normalizeCourseRubrics(data) {
  const rubrics = Array.isArray(data?.verticals)
    ? data.verticals.map((vertical, index) => ({
        id: vertical.id,
        title: vertical.title || `Subsection ${index + 1}`,
      }))
    : []
  return rubrics
}

export async function fetchClassrooms() {
  return classroomApi.fetchClassrooms()
}

export async function fetchStudentsForClass(classId) {
  const result = await classroomApi.fetchStudentsList(classId)
  return normalizeStudentsList(result)
}

export async function fetchCourseRubrics(courseId) {
  const data = await fetchCourseIntegration(courseId)
  return normalizeCourseRubrics(data)
}

function buildReportBody({ courseId, students, rubrics }) {
  return {
    course_id: courseId,
    users: mapStudentsForReportRequest(students),
    rubrics: mapRubricsForReportRequest(rubrics),
  }
}

async function postGradingReport(path, body, signal) {
  const response = await fetch(`${base_url}${path}`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to load report.")
  }
  return response.json()
}

export async function fetchGradeReport({ courseId, students, rubrics, signal }) {
  const payload = await postGradingReport(
    REPORT_ENDPOINTS[REPORT_TYPES.GRADE],
    buildReportBody({ courseId, students, rubrics }),
    signal
  )
  return normalizeGradeReport(payload, students, rubrics)
}

export async function fetchLessonActivityReport({ courseId, students, rubrics, signal }) {
  const payload = await postGradingReport(
    REPORT_ENDPOINTS[REPORT_TYPES.LESSON_ACTIVITY],
    buildReportBody({ courseId, students, rubrics }),
    signal
  )
  return normalizeLessonActivityReport(payload)
}

export async function fetchOverdueLessonsReport({ courseId, students, rubrics, signal }) {
  const payload = await postGradingReport(
    REPORT_ENDPOINTS[REPORT_TYPES.OVERDUE],
    buildReportBody({ courseId, students, rubrics }),
    signal
  )
  return normalizeOverdueLessonsReport(payload)
}

export async function fetchReportByType(reportType, params) {
  if (reportType === REPORT_TYPES.LESSON_ACTIVITY) {
    return fetchLessonActivityReport(params)
  }
  if (reportType === REPORT_TYPES.OVERDUE) {
    return fetchOverdueLessonsReport(params)
  }
  return fetchGradeReport(params)
}

async function postExportReportCsv(path, body) {
  const response = await fetch(`${base_url}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to export report.")
  }
  return response
}

export async function exportReportCsvByType(reportType, { courseId, students, rubrics }) {
  const path = REPORT_EXPORT_ENDPOINTS[reportType] || REPORT_EXPORT_ENDPOINTS[REPORT_TYPES.GRADE]
  return postExportReportCsv(path, buildReportBody({ courseId, students, rubrics }))
}

export function downloadBlobResponse(response, fallbackFilename) {
  return response.blob().then((blob) => {
    const disposition = response.headers.get("content-disposition") || ""
    const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)"?/i)
    const filename = match?.[1] ? decodeURIComponent(match[1]) : fallbackFilename
    const link = document.createElement("a")
    const objectUrl = URL.createObjectURL(blob)
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
  })
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
