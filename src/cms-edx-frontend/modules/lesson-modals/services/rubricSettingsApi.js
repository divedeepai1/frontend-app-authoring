import { base_url } from "../../../../compugrade-constants"
import { normalizeRubricIds } from "../utils/rubricIds"

async function postJson(path, body) {
  const res = await fetch(`${base_url}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}

function withRubricIds(rubricIdOrIds, extra = {}) {
  const rubric_openedx_based_ids = normalizeRubricIds(rubricIdOrIds)
  if (!rubric_openedx_based_ids.length) {
    throw new Error("At least one rubric id is required.")
  }
  return {
    rubric_openedx_based_ids,
    ...extra,
  }
}

export function fetchRubricStatusDates(rubricIdOrIds, studentIds) {
  return postJson(
    "/api/lms/get_rubric_status_dates",
    withRubricIds(rubricIdOrIds, { student_ids: studentIds })
  )
}

export function updateRubricStatusDates(
  rubricIdOrIds,
  startDate,
  dueDate,
  studentIds,
  { applyAllFields = false, sendStart = false, sendDue = false } = {}
) {
  const body = withRubricIds(rubricIdOrIds, { student_ids: studentIds })

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

export function fetchRubricTimerState(rubricIdOrIds, studentIds) {
  return postJson(
    "/api/lms/get_rubric_timer_state",
    withRubricIds(rubricIdOrIds, { student_ids: studentIds })
  )
}

export function setRubricTimerState(rubricIdOrIds, timeAllowed, timerMode, studentIds) {
  return postJson(
    "/api/lms/set_rubric_timer_state",
    withRubricIds(rubricIdOrIds, {
      time_allowed: timeAllowed,
      timer_mode: timerMode,
      student_ids: studentIds,
    })
  )
}

export function fetchRubricNumAttempts(rubricIdOrIds, studentIds) {
  return postJson(
    "/api/lms/get_rubric_num_attempts",
    withRubricIds(rubricIdOrIds, { student_ids: studentIds })
  )
}

export function setRubricNumAttempts(rubricIdOrIds, attemptsAllotted, numOfAttempts, studentIds) {
  return postJson(
    "/api/lms/set_rubric_num_attempts",
    withRubricIds(rubricIdOrIds, {
      attempts_allotted: attemptsAllotted,
      num_of_attempts: numOfAttempts,
      student_ids: studentIds,
    })
  )
}
