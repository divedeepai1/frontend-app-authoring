import { getConfig } from "@edx/frontend-platform"
import { base_url } from "../../../../compugrade-constants"
import * as classroomApi from "../../manage-classes/services/classroomApi"
import { fetchCourseIntegration } from "../../manage-course/services/curriculumApi"
import {
  formatContentTypeLabel,
  usesAssessmentStyle,
} from "../../common/contentType"

const toCellMap = (grades) => {
  if (!grades) return {}
  if (Array.isArray(grades)) {
    return grades.reduce((acc, grade) => {
      const lessonId = grade?.rubric_id ?? grade?.lesson_id ?? grade?.id
      if (lessonId !== undefined && lessonId !== null) {
        acc[String(lessonId)] = grade
      }
      return acc
    }, {})
  }
  if (typeof grades === "object") return grades
  return {}
}

export function normalizeGradebookResponse(payload, fallbackStudents, fallbackLessons) {
  const body = payload?.data && typeof payload.data === "object" ? payload.data : payload || {}
  const lessonList = Array.isArray(body.lessons)
    ? body.lessons.map((lesson, index) => {
        const lessonId = lesson.id ?? lesson.rubric_id ?? lesson.lesson_id
        return {
          id: lessonId,
          title: lesson.title ?? lesson.name ?? `Lesson ${index + 1}`,
          contentType: formatContentTypeLabel(lesson),
          isAssessmentStyle: usesAssessmentStyle(lesson),
        }
      })
    : (fallbackLessons || []).map((lesson) => ({
        ...lesson,
        contentType: lesson.contentType || formatContentTypeLabel(lesson),
        isAssessmentStyle:
          lesson.isAssessmentStyle ?? usesAssessmentStyle(lesson),
      }))
  const fallbackById = new Map(
    (fallbackStudents || []).map((student) => [String(student.id), student])
  )
  const studentsFromApi = Array.isArray(body.students)
    ? body.students.map((student) => {
        const studentId = student.id ?? student.user_id ?? student.student_id
        const fallback = fallbackById.get(String(studentId))
        const combinedName = `${student.first_name || ""} ${student.last_name || ""}`.trim()
        const resolvedName =
          student.name ||
          student.full_name ||
          combinedName ||
          student.email ||
          fallback?.name ||
          `Student ${studentId ?? ""}`
        return {
          id: studentId,
          firstName: student.first_name ?? fallback?.firstName ?? "",
          lastName: student.last_name ?? fallback?.lastName ?? "",
          name: resolvedName,
          email: student.email ?? fallback?.email ?? "",
        }
      })
    : fallbackStudents
  const rows = Array.isArray(body.rows) ? body.rows : Array.isArray(body.gradebook) ? body.gradebook : []
  const gradesByStudent = {}
  rows.forEach((row) => {
    const studentId = row?.student_id ?? row?.user_id ?? row?.id
    if (studentId !== undefined && studentId !== null) {
      gradesByStudent[String(studentId)] = toCellMap(row?.grades || row?.lessons || row?.grade_map)
    }
  })
  if (Array.isArray(body.students)) {
    body.students.forEach((student) => {
      const studentId = student?.id ?? student?.user_id ?? student?.student_id
      if (studentId !== undefined && studentId !== null && !gradesByStudent[String(studentId)]) {
        gradesByStudent[String(studentId)] = toCellMap(student?.grades || student?.lessons || student?.grade_map)
      }
    })
  }
  if (body.grade_map && typeof body.grade_map === "object") {
    Object.keys(body.grade_map).forEach((studentId) => {
      gradesByStudent[String(studentId)] = toCellMap(body.grade_map[studentId])
    })
  }
  const editedLessonIds = new Set(
    Array.isArray(body.edited_lesson_ids)
      ? body.edited_lesson_ids.map((value) => String(value))
      : Array.isArray(body.edited_lessons)
        ? body.edited_lessons.map((item) => String(item?.id ?? item?.rubric_id ?? item))
        : []
  )
  return {
    lessons: lessonList.filter((lesson) => lesson.id !== undefined && lesson.id !== null),
    students: studentsFromApi.filter((student) => student.id !== undefined && student.id !== null),
    gradesByStudent,
    editedLessonIds,
  }
}

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

export async function postViewGradebook({ courseId, students, rubrics, signal }) {
  const response = await fetch(`${base_url}/api/grading/view_gradebook`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: courseId,
      users: students.map((student) => ({
        user_id: student.id,
        email: student.email || "",
      })),
      rubrics: rubrics.map((lesson) => ({
        rubric_id: lesson.id,
        title: lesson.title || "",
      })),
    }),
  })
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to load gradebook.")
  }
  return response.json()
}

export async function postExportGradebookCsv({ courseId, students, rubrics }) {
  const response = await fetch(`${base_url}/api/grading/export_gradebook_csv`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: courseId,
      users: students.map((student) => ({
        user_id: student.id,
        email: student.email || "",
      })),
      rubrics: rubrics.map((rubric) => ({
        rubric_id: rubric.id,
        title: rubric.title || "",
      })),
    }),
  })
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to export gradebook.")
  }
  return response
}

export async function postOverrideGradebook({ courseId, rubricId, userId, overrideScore, reason }) {
  const response = await fetch(`${base_url}/api/grading/override_gradebook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: courseId,
      rubric_id: rubricId,
      user_id: userId,
      override_score: overrideScore,
      reason,
    }),
  })
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to update grade.")
  }
  return response.json()
}

export async function postSaveClassOverrideWeight({
  courseId,
  studentIds,
  lessonWeight,
  quizWeight,
  testWeight,
}) {
  const response = await fetch(`${base_url}/api/grading/save_class_override_weight_settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: courseId,
      student_ids: studentIds,
      lesson_weight: lessonWeight,
      quiz_weight: quizWeight,
      test_weight: testWeight,
    }),
  })
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to save class override weightage.")
  }
  return response.json()
}

export async function postGetClassOverrideWeight({ courseId, studentIds }) {
  const response = await fetch(`${base_url}/api/grading/get_class_override_weight_settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: courseId,
      student_ids: studentIds,
    }),
  })
  if (!response.ok) {
    throw new Error((await response.text()) || "Failed to fetch class override weightage.")
  }
  return response.json()
}

function hasWeightFields(payload) {
  if (!payload || typeof payload !== "object") return false
  return (
    payload.lesson_weight !== undefined ||
    payload.quiz_weight !== undefined ||
    payload.test_weight !== undefined ||
    payload.assessment_weight !== undefined
  )
}

export function parseClassOverrideWeightResponse(data) {
  const studentPayload = data?.students
  let firstStudentWeight = null

  if (Array.isArray(studentPayload)) {
    firstStudentWeight = studentPayload.find((student) => student && hasWeightFields(student)) || null
  } else if (studentPayload && typeof studentPayload === "object") {
    if (hasWeightFields(studentPayload)) {
      firstStudentWeight = studentPayload
    } else {
      const firstValue = Object.values(studentPayload)[0]
      if (firstValue && typeof firstValue === "object") {
        firstStudentWeight = firstValue
      }
    }
  } else if (hasWeightFields(data)) {
    firstStudentWeight = data
  }

  return {
    lessonWeight: firstStudentWeight?.lesson_weight,
    quizWeight: firstStudentWeight?.quiz_weight,
    testWeight: firstStudentWeight?.test_weight,
    // Legacy fallback for older responses
    assessmentWeight: firstStudentWeight?.assessment_weight,
  }
}
