export const normalizeObjectiveType = (q) => {
  const raw = String(q.objective_type || q.type || "").toLowerCase().replace(/_/g, "-")
  if (raw.includes("true") && raw.includes("false")) return "true-false"
  if (raw === "mcq" || raw === "multiple-choice" || raw === "multiplechoice") return "multiple-choice"
  if (raw.includes("multi") && raw.includes("select")) return "multi-select"
  if (raw.includes("fill")) return "fill-in-the-blank"
  if (raw === "short-answer" || raw === "shortanswer") return "short-answer"
  if (raw.includes("match")) return "matching"
  if (raw.includes("order") || raw === "reordering") return "ordering"
  if (raw.includes("categor")) return "categorizing"
  return raw || "multiple-choice"
}

export const pickResponse = (q) => {
  const keys = [
    "student_answer",
    "user_answer",
    "filled_answer",
    "response",
    "selected_answer",
    "learner_answer",
  ]
  for (const k of keys) {
    if (q[k] !== undefined && q[k] !== null && q[k] !== "") return q[k]
  }
  return q.correct_answer !== undefined ? q.correct_answer : null
}

export const optionText = (opt, i) => {
  if (opt == null) return `Option ${i + 1}`
  if (typeof opt === "string") return opt
  return opt.text != null ? String(opt.text) : String(opt)
}

export const optionRowStyle = (active, accentColor) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 8,
  border: active ? `2px solid ${accentColor}` : "1px solid #e5e7eb",
  background: "#fff",
  cursor: "default",
})

export const radioStyle = {
  width: 18,
  height: 18,
  accentColor: "#27aae1",
  cursor: "default",
  flexShrink: 0,
}
