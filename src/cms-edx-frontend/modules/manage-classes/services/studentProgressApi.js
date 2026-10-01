import { base_url } from "../../../../compugrade-constants"

/**
 * Reset a student's course progress (grades/attempts).
 * Used by the students table reset action and after a move when include_grades is false.
 * @param {number|string} userId
 */
export async function resetStudentProgress(userId) {
  if (userId == null || userId === "") {
    throw new Error("Student id is required to reset progress.")
  }

  const response = await fetch(`${base_url}/api/openedx/user/reset_student_progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || "Failed to reset student progress.")
  }

  return response.json().catch(() => ({}))
}
