import { getConfig } from "@edx/frontend-platform"

/**
 * Fetch the signed-in teacher's district/school context.
 * Auth is cookie/session based — only credentials: "include" is required.
 */
export async function fetchDistrictSchool() {
  const res = await fetch(
    `${getConfig().STUDIO_BASE_URL}/myplugin/context/district-school/`,
    {
      method: "GET",
      credentials: "include",
    }
  )

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Failed to load district/school context (${res.status})`)
  }

  return res.json()
}

export function normalizeDistrictSchool(payload) {
  const body = payload && typeof payload === "object" ? payload : {}
  return {
    districtId: body.district_id ?? null,
    districtName: String(body.district_name || "").trim(),
    schoolId: body.school_id ?? null,
    schoolName: String(body.school_name || "").trim(),
  }
}
