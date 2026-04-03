import { useEffect, useState } from "react"
import { X } from "lucide-react"

const isValidPositiveFloatInput = (value) =>
  value === "" || /^(\d+\.?\d*|\.\d+)$/.test(value)

const GradeOverrideModal = ({
  isOpen,
  onClose,
  courseId,
  student,
  lesson,
  initialValue,
  onSubmit,
  saving,
}) => {
  const [actionType, setActionType] = useState("override")
  const [score, setScore] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isOpen) {
      setActionType("override")
      setScore("")
      setReason("")
      setError("")
      return
    }
    setActionType("override")
    setScore(initialValue === null || initialValue === undefined ? "" : String(initialValue))
    setReason("")
    setError("")
  }, [isOpen, initialValue])

  const handleSave = async () => {
    if (actionType === "override") {
      const trimmedScore = score.trim()
      if (trimmedScore === "") {
        setError("Please enter a grade value to override.")
        return
      }
      if (!isValidPositiveFloatInput(trimmedScore)) {
        setError("Grade must be a positive number greater than 0.")
        return
      }
      const parsed = parseFloat(trimmedScore)
      if (Number.isNaN(parsed) || parsed <= 0) {
        setError("Grade must be a positive number greater than 0.")
        return
      }
    }
    setError("")
    const trimmedScore = score.trim()
    const parsedScore =
      actionType === "override" && trimmedScore !== "" ? parseFloat(trimmedScore) : null
    await onSubmit({
      courseId,
      rubricId: lesson?.id,
      userId: student?.id,
      overrideScore:
        actionType === "reset" ? null : Number.isFinite(parsedScore) ? parsedScore : null,
      reason: reason.trim(),
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 pt-[4%] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 border-none" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[92vw] max-w-xl overflow-visible">
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
          <div>
            <div className="primary-text" style={{ fontWeight: 600, fontSize: 16 }}>
              Edit lesson grade
            </div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>
              {student?.name || student?.email || "Student"} • {lesson?.title || "Lesson"}
            </div>
          </div>
          <div
            className="p-1 rounded hover:bg-gray-100 border-none"
            style={{ cursor: "pointer" }}
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </div>
        </div>
        <div className="px-4 py-3" style={{ fontSize: 13 }}>
          {error && (
            <div className="alert alert-danger py-1 px-2 mb-3" style={{ fontSize: 12 }}>
              {error}
            </div>
          )}
          <div className="mb-3">
            <label className="form-label mb-1" style={{ fontWeight: 500 }}>
              Action
            </label>
            <select
              className="form-control"
              value={actionType}
              onChange={(event) => setActionType(event.target.value)}
              disabled={saving}
            >
              <option value="override">Override grade</option>
              <option value="reset">Reset grade</option>
            </select>
          </div>
          {actionType === "override" && (
            <div className="mb-3">
              <label className="form-label mb-1" style={{ fontWeight: 500 }}>
                Grade value
              </label>
              <input
                type="text"
                className="form-control"
                value={score}
                onChange={(event) => {
                  const nextValue = event.target.value
                  if (isValidPositiveFloatInput(nextValue)) {
                    setScore(nextValue)
                    if (error) setError("")
                  }
                }}
                placeholder="e.g. 85 or 8.5"
                disabled={saving}
              />
            </div>
          )}
          <div className="mb-3">
            <label className="form-label mb-1" style={{ fontWeight: 500 }}>
              Reason (optional)
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Add a note for this grade change"
              disabled={saving}
            />
          </div>
          <div className="d-flex justify-content-end mt-3">
            <button
              className="secondary-button px-3 py-1 mr-2"
              style={{ fontSize: 12 }}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="primary-button px-3 py-2"
              style={{ fontSize: 12 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save change"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GradeOverrideModal
