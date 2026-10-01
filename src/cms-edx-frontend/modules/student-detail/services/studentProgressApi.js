import { getConfig } from "@edx/frontend-platform"
import { fetchCsrfToken } from "../../../../cms-csrftoken"
import { base_url } from "../../../../compugrade-constants"

export async function fetchCourseIntegration(courseKey) {
  const token = await fetchCsrfToken()
  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/course-integration/?course_key=${encodeURIComponent(courseKey)}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
    }
  )
  if (!res.ok) {
    throw new Error((await res.text()) || String(res.status))
  }
  return res.json()
}

export async function fetchCourseProgressForUser({ courseId, userId, contentData }) {
  const res = await fetch(`${base_url}/api/grading/get_course_progress_for_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: courseId,
      user_id: userId,
      content_data: contentData,
    }),
  })
  if (!res.ok) {
    throw new Error((await res.text()) || "Failed to load course progress.")
  }
  return res.json()
}

export function mapProgressToLessons(result) {
  const { overall_progress, overall_score, subsections } = result?.data || {}
  const mappedLessons =
    Array.isArray(subsections) && subsections.length > 0
      ? subsections.map((sub) => ({
          section: sub.subsection_title,
          sectionKey: sub.subsection_id,
          targetProgress: sub.average_progress,
          items: (sub.rubrics || []).map((rubric) => ({
            name: rubric.rubric_title,
            targetProgress: rubric.progress,
            lastAttempt: "--",
            grade: rubric.score > 0 ? `${rubric.score}%` : "--",
            dueDate: rubric.due_date
              ? new Date(rubric.due_date).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            letterGrade: rubric.score >= 50 ? "Pass" : "--",
            subrubrics: rubric.subrubrics || [],
          })),
        }))
      : []

  const expanded = {}
  mappedLessons.forEach((s) => {
    expanded[s.sectionKey] = true
  })

  return {
    courseProgress: overall_progress ?? 0,
    averageGrade: overall_score ?? 0,
    lessons: mappedLessons,
    expandedSections: expanded,
  }
}
