export function normalizeRubricIds(rubricIdOrIds) {
  const raw = Array.isArray(rubricIdOrIds) ? rubricIdOrIds : [rubricIdOrIds]
  return raw.map((id) => String(id || "").trim()).filter(Boolean)
}

export function resolveRubricIds({ rubricIds, rubricId }) {
  const fromList = normalizeRubricIds(rubricIds)
  if (fromList.length) return fromList
  return normalizeRubricIds(rubricId)
}
