export const clampWeight = (value) => Math.min(100, Math.max(0, value))

export const parseWeight = (value) => {
  if (value === "" || value === null || typeof value === "undefined") {
    return null
  }
  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    return null
  }
  return parsed
}

export const sanitizeWeightInput = (value) => {
  if (value === "") {
    return ""
  }
  const sanitized = value.replace(/[^0-9.]/g, "")
  const firstDotIndex = sanitized.indexOf(".")
  const normalized =
    firstDotIndex === -1
      ? sanitized
      : `${sanitized.slice(0, firstDotIndex + 1)}${sanitized.slice(firstDotIndex + 1).replace(/\./g, "")}`
  const parsed = parseWeight(normalized)
  if (parsed === null) {
    return ""
  }
  return clampWeight(parsed).toString()
}
