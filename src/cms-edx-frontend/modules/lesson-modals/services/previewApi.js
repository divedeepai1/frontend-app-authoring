import { base_url } from "../../../../compugrade-constants"

export async function fetchRubricForTeacher(openedxBasedId) {
  const encoded = encodeURIComponent(openedxBasedId)
  const res = await fetch(
    `${base_url}/api/openedx/get_rubric_for_teacher?openedx_based_id=${encoded}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }
  )
  if (!res.ok) throw new Error(await res.text() || String(res.status))
  return res.json()
}

export function unwrapRubric(json) {
  if (!json || typeof json !== "object") return null
  if (json.rubric && typeof json.rubric === "object") return json.rubric
  if (json.data?.rubric && typeof json.data.rubric === "object") return json.data.rubric
  if (json.data && typeof json.data === "object" && !Array.isArray(json.data)) return json.data
  return json
}
