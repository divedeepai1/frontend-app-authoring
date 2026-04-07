import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { base_url } from "../../../compugrade-constants"

const TIMER_MODE_OPTIONS = [
  { label: "Display timer only", value: "display" },
  { label: "Lock lesson when time ends", value: "lock" },
]

const normalizeTimerPayload = (payload) => {
  if (!payload) return null
  if (Array.isArray(payload)) return payload[0] || null
  if (typeof payload === "object") {
    if (payload.data && typeof payload.data === "object") return payload.data
    if (Array.isArray(payload.results)) return payload.results[0] || null
    return payload
  }
  return null
}

const secondsToHoursMinutes = (totalSeconds) => {
  const safeSeconds = Number.isInteger(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  return { hours, minutes }
}

const hoursMinutesToSeconds = (hours, minutes) => {
  const safeHours = Number.isInteger(hours) && hours >= 0 ? hours : 0
  const safeMinutes = Number.isInteger(minutes) && minutes >= 0 ? minutes : 0
  return (safeHours * 3600) + (safeMinutes * 60)
}

const formatTwoDigits = (value) => String(value).padStart(2, "0")

const ScrollableDropdown = ({
  label,
  value,
  options,
  suffix,
  placeholder,
  disabled,
  onChange,
}) => {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleDocumentClick)
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick)
    }
  }, [])

  const selectedLabel = value ? `${value} ${suffix}` : placeholder

  return (
    <div style={{ flex: 1, position: "relative" }} ref={wrapperRef}>
      <label className="form-label mb-1">{label}</label>
      <button
        type="button"
        className="form-control d-flex align-items-center justify-content-between"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        style={{ textAlign: "left", height: 38 }}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 60,
            background: "#fff",
            border: "1px solid #D1D5DB",
            borderRadius: 4,
            maxHeight: 210,
            overflowY: "auto",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          {options.map((option) => {
            const isActive = option === value
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
                style={{
                  width: "100%",
                  border: "none",
                  textAlign: "left",
                  background: isActive ? "#F3F4F6" : "#fff",
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {option} {suffix}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const LessonTimerModal = ({ isOpen, onClose, title, rubricId, students }) => {
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")
  const [timerMode, setTimerMode] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const studentIds = useMemo(
    () => (Array.isArray(students) ? students.map((student) => student.id) : []),
    [students]
  )
  const hourOptions = useMemo(
    () => Array.from({ length: 24 }, (_, index) => formatTwoDigits(index)),
    []
  )
  const minuteOptions = useMemo(
    () => Array.from({ length: 60 }, (_, index) => formatTwoDigits(index)),
    []
  )

  useEffect(() => {
    if (!isOpen) {
      setHours("")
      setMinutes("")
      setTimerMode("")
      setLoading(false)
      setSaving(false)
      setRemoving(false)
      setError("")
      setSuccess("")
      return
    }

    if (!rubricId) {
      setError("Missing lesson information.")
      return
    }

    const loadTimerState = async () => {
      setLoading(true)
      setError("")
      setSuccess("")
      try {
        const response = await fetch(`${base_url}/api/lms/get_rubric_timer_state`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rubric_openedx_based_id: rubricId,
            student_ids: studentIds,
          }),
        })

        if (!response.ok) {
          const text = await response.text()
          throw new Error(text || "Failed to load timer state.")
        }

        const json = await response.json()
        const timerData = normalizeTimerPayload(json)
        const loadedTime = timerData?.time_allowed
        const loadedMode = timerData?.timer_mode

        if (Number.isInteger(loadedTime) && loadedTime > 0) {
          const mappedTime = secondsToHoursMinutes(loadedTime)
          setHours(formatTwoDigits(Math.min(23, mappedTime.hours)))
          setMinutes(formatTwoDigits(mappedTime.minutes))
        } else {
          setHours("")
          setMinutes("")
        }

        if (loadedMode === "display" || loadedMode === "lock") {
          setTimerMode(loadedMode)
        } else {
          setTimerMode("")
        }
      } catch (e) {
        setError("Unable to load timer settings right now.")
      } finally {
        setLoading(false)
      }
    }

    loadTimerState()
  }, [isOpen, rubricId, studentIds])

  const validate = () => {
    const parsedHours = Number(hours)
    const parsedMinutes = Number(minutes)
    if (!Number.isInteger(parsedHours) || parsedHours < 0) {
      return "Hours must be a whole number greater than or equal to 0."
    }
    if (!Number.isInteger(parsedMinutes) || parsedMinutes < 0 || parsedMinutes > 59) {
      return "Minutes must be a whole number between 0 and 59."
    }
    const totalSeconds = hoursMinutesToSeconds(parsedHours, parsedMinutes)
    if (totalSeconds <= 0) {
      return "Please enter a valid timer duration."
    }
    if (timerMode !== "display" && timerMode !== "lock") {
      return "Please select a valid timer mode."
    }
    return ""
  }

  const handleSave = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      setSuccess("")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const response = await fetch(`${base_url}/api/lms/set_rubric_timer_state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rubric_openedx_based_id: rubricId,
          time_allowed: hoursMinutesToSeconds(Number(hours), Number(minutes)),
          timer_mode: timerMode,
          student_ids: studentIds,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Failed to save timer settings.")
      }

      setSuccess("Timer settings saved successfully.")
    } catch (e) {
      setError("Unable to save timer settings right now.")
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveTimer = async () => {
    setRemoving(true)
    setError("")
    setSuccess("")
    try {
      const response = await fetch(`${base_url}/api/lms/set_rubric_timer_state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rubric_openedx_based_id: rubricId,
          time_allowed: null,
          timer_mode: null,
          student_ids: studentIds,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Failed to remove timer settings.")
      }

      setHours("")
      setMinutes("")
      setTimerMode("")
      setSuccess("Timer removed successfully.")
    } catch (e) {
      setError("Unable to remove timer settings right now.")
    } finally {
      setRemoving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 pt-[4%] flex items-center justify-center">
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.55; }
          100% { opacity: 1; }
        }
      `}</style>
      <div className="absolute inset-0 bg-black/40 border-none" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[92vw] max-w-2xl overflow-visible">
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
          <div>
            <div className="primary-text" style={{ fontWeight: 600, fontSize: 16 }}>
              Lesson timer setup
            </div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>{title || "Lesson"}</div>
          </div>
          <div className="d-flex align-items-center">
            <button
              className="secondary-button px-3 py-1 mr-2"
              style={{ fontSize: 12 }}
              onClick={handleRemoveTimer}
              disabled={saving || loading || removing}
            >
              {removing ? "Removing..." : "Remove timer"}
            </button>
            <div
              className="p-1 rounded hover:bg-gray-100 border-none"
              style={{ cursor: "pointer" }}
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="px-4 py-3" style={{ fontSize: 13 }}>
          {error && (
            <div className="alert alert-danger py-1 px-2 mb-3" style={{ fontSize: 12 }}>
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success py-1 px-2 mb-3" style={{ fontSize: 12 }}>
              {success}
            </div>
          )}

          {loading ? (
            <div>
              <div className="mb-3">
                <label className="form-label mb-1" style={{ fontWeight: 500 }}>
                  Timer mode
                </label>
                <div
                  style={{
                    height: 38,
                    borderRadius: 4,
                    backgroundColor: "#E5E7EB",
                    animation: "pulse 1.4s ease-in-out infinite",
                  }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label mb-1" style={{ fontWeight: 500 }}>
                  Time allowed
                </label>
                <div className="d-flex" style={{ gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label mb-1">Hours</label>
                    <div
                      style={{
                        height: 38,
                        borderRadius: 4,
                        backgroundColor: "#E5E7EB",
                        animation: "pulse 1.4s ease-in-out infinite",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label mb-1">Minutes</label>
                    <div
                      style={{
                        height: 38,
                        borderRadius: 4,
                        backgroundColor: "#E5E7EB",
                        animation: "pulse 1.4s ease-in-out infinite",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <label className="form-label mb-1" style={{ fontWeight: 500 }}>
                  Timer mode
                </label>
                <select
                  className="form-control"
                  value={timerMode}
                  onChange={(event) => setTimerMode(event.target.value)}
                  disabled={saving}
                >
                  <option value="">Select mode</option>
                  {TIMER_MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label mb-1" style={{ fontWeight: 500 }}>
                  Time allowed
                </label>
                <div className="d-flex" style={{ gap: 12 }}>
                  <ScrollableDropdown
                    label="Hours"
                    value={hours}
                    options={hourOptions}
                    suffix="hr"
                    placeholder="Select hours"
                    disabled={saving}
                    onChange={setHours}
                  />
                  <ScrollableDropdown
                    label="Minutes"
                    value={minutes}
                    options={minuteOptions}
                    suffix="min"
                    placeholder="Select minutes"
                    disabled={saving}
                    onChange={setMinutes}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-end mt-3">
            <button
              className="secondary-button px-3 py-1 mr-2"
              style={{ fontSize: 12 }}
              onClick={onClose}
              disabled={saving || removing}
            >
              Cancel
            </button>
            <button
              className="primary-button px-3 py-2"
              style={{ fontSize: 12 }}
              onClick={handleSave}
              disabled={saving || loading || removing}
            >
              {saving ? "Saving..." : "Save timer settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonTimerModal
