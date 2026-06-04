import { base_url } from "../../../../compugrade-constants"

async function postJson(path, body) {
  const res = await fetch(`${base_url}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}

export function fetchRubricStatusDates(rubricId, studentIds) {
  return postJson("/api/lms/get_rubric_status_dates", {
    rubric_openedx_based_id: rubricId,
    student_ids: studentIds,
  })
}

export function updateRubricStatusDates(
  rubricId,
  startDate,
  dueDate,
  studentIds,
  { applyAllFields = false, sendStart = false, sendDue = false } = {}
) {
  const body = {
    rubric_openedx_based_id: rubricId,
    student_ids: studentIds,
  }

  if (applyAllFields) {
    body.start_date = startDate ?? null
    body.due_date = dueDate ?? null
  } else {
    if (sendStart) body.start_date = startDate ?? null
    if (sendDue) body.due_date = dueDate ?? null
    if (!sendStart && !sendDue) {
      if (startDate) body.start_date = startDate
      if (dueDate) body.due_date = dueDate
    }
  }

  return postJson("/api/lms/update_rubric_status_dates", body)
}

export function fetchRubricTimerState(rubricId, studentIds) {
  return postJson("/api/lms/get_rubric_timer_state", {
    rubric_openedx_based_id: rubricId,
    student_ids: studentIds,
  })
}

export function setRubricTimerState(rubricId, timeAllowed, timerMode, studentIds) {
  return postJson("/api/lms/set_rubric_timer_state", {
    rubric_openedx_based_id: rubricId,
    time_allowed: timeAllowed,
    timer_mode: timerMode,
    student_ids: studentIds,
  })
}

export function fetchRubricNumAttempts(rubricId, studentIds) {
  return postJson("/api/lms/get_rubric_num_attempts", {
    rubric_openedx_based_id: rubricId,
    student_ids: studentIds,
  })
}

export function setRubricNumAttempts(rubricId, attemptsAllotted, numOfAttempts, studentIds) {
  return postJson("/api/lms/set_rubric_num_attempts", {
    rubric_openedx_based_id: rubricId,
    attempts_allotted: attemptsAllotted,
    num_of_attempts: numOfAttempts,
    student_ids: studentIds,
  })
}
