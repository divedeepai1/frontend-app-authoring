import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { base_url } from "../../../compugrade-constants"

const TIMER_MODE_OPTIONS = [
  { label: "Display timer only", value: "display" },
  { label: "Lock lesson when time ends", value: "lock" },
]

const normalizeTimerPayload = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (typeof payload === "object") {
    if (Array.isArray(payload.data)) return payload.data
    if (Array.isArray(payload.results)) return payload.results
    if (payload.data && typeof payload.data === "object") return [payload.data]
    return [payload]
  }
  return []
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

const LessonTimerModal = ({ isOpen, onClose, title, rubricId, students }) => {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState("")
  const [globalTimerMode, setGlobalTimerMode] = useState("display")
  const [globalHours, setGlobalHours] = useState("00")
  const [globalMinutes, setGlobalMinutes] = useState("05")
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [savingAll, setSavingAll] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const studentIds = useMemo(
    () => (
      Array.isArray(students)
        ? students
            .map((student) => student?.id ?? student?.user_id ?? student?.student_id)
            .filter((id) => id !== undefined && id !== null)
        : []
    ),
    [students]
  )
  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, index) => formatTwoDigits(index)), [])
  const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, index) => formatTwoDigits(index)), [])
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => {
      const name = String(row.name || "").toLowerCase()
      const email = String(row.email || "").toLowerCase()
      return name.includes(query) || email.includes(query) || String(row.id).includes(query)
    })
  }, [rows, search])

  const mapStudentRows = (timerItems) => {
    const timerByStudent = {}
    timerItems.forEach((item) => {
      const studentId = item?.student_id ?? item?.user_id ?? item?.id
      if (studentId === undefined || studentId === null) return
      timerByStudent[String(studentId)] = item
    })
    return (students || []).map((student) => {
      const studentId = student?.id ?? student?.user_id ?? student?.student_id
      if (studentId === undefined || studentId === null) return null
      const timer = timerByStudent[String(studentId)] || {}
      const timeAllowed = Number(timer?.time_allowed)
      const parsed = Number.isInteger(timeAllowed) && timeAllowed > 0
        ? secondsToHoursMinutes(timeAllowed)
        : { hours: 0, minutes: 0 }
      const fullName = [student?.first_name, student?.last_name].filter(Boolean).join(" ").trim()
      return {
        id: studentId,
        name: student.name || student.full_name || fullName || student.email || `Student ${studentId}`,
        email: student.email || "",
        timerMode: timer?.timer_mode === "display" || timer?.timer_mode === "lock" ? timer.timer_mode : "display",
        hours: formatTwoDigits(parsed.hours),
        minutes: formatTwoDigits(parsed.minutes),
      }
    }).filter(Boolean)
  }

  const getInitialGlobalTimer = (timerItems, mappedRows) => {
    const firstValidTimer = (timerItems || []).find((item) => {
      const mode = item?.timer_mode
      const timeAllowed = Number(item?.time_allowed)
      return (mode === "display" || mode === "lock") && Number.isInteger(timeAllowed) && timeAllowed > 0
    })

    if (firstValidTimer) {
      const parsed = secondsToHoursMinutes(Number(firstValidTimer.time_allowed))
      return {
        mode: firstValidTimer.timer_mode,
        hours: formatTwoDigits(parsed.hours),
        minutes: formatTwoDigits(parsed.minutes),
      }
    }

    const firstRow = (mappedRows || [])[0]
    if (firstRow) {
      return {
        mode: firstRow.timerMode === "lock" ? "lock" : "display",
        hours: firstRow.hours || "00",
        minutes: firstRow.minutes || "00",
      }
    }

    return {
      mode: "display",
      hours: "00",
      minutes: "05",
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setRows([])
      setSearch("")
      setGlobalTimerMode("display")
      setGlobalHours("00")
      setGlobalMinutes("05")
      setLoading(false)
      setSavingId(null)
      setSavingAll(false)
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
        const timerItems = normalizeTimerPayload(json)
        const mappedRows = mapStudentRows(timerItems)
        const initialGlobalTimer = getInitialGlobalTimer(timerItems, mappedRows)
        setRows(mappedRows)
        setGlobalTimerMode(initialGlobalTimer.mode)
        setGlobalHours(initialGlobalTimer.hours)
        setGlobalMinutes(initialGlobalTimer.minutes)
      } catch (e) {
        setError("Unable to load timer settings right now.")
      } finally {
        setLoading(false)
      }
    }

    loadTimerState()
  }, [isOpen, rubricId, studentIds])

  const validateRow = (row) => {
    const parsedHours = Number(row.hours)
    const parsedMinutes = Number(row.minutes)
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
    if (row.timerMode !== "display" && row.timerMode !== "lock") {
      return "Please select a valid timer mode."
    }
    return ""
  }

  const validateGlobal = () => {
    const parsedHours = Number(globalHours)
    const parsedMinutes = Number(globalMinutes)
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
    if (globalTimerMode !== "display" && globalTimerMode !== "lock") {
      return "Please select a valid timer mode."
    }
    return ""
  }

  const setTimerForStudents = async ({ timerMode, hours, minutes, ids }) => {
    const response = await fetch(`${base_url}/api/lms/set_rubric_timer_state`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rubric_openedx_based_id: rubricId,
        time_allowed: hoursMinutesToSeconds(Number(hours), Number(minutes)),
        timer_mode: timerMode,
        student_ids: ids,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || "Failed to save timer settings.")
    }
  }

  const removeTimerForStudents = async (ids) => {
    const response = await fetch(`${base_url}/api/lms/set_rubric_timer_state`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rubric_openedx_based_id: rubricId,
        time_allowed: null,
        timer_mode: null,
        student_ids: ids,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || "Failed to remove timer settings.")
    }
  }

  const handleRowChange = (studentId, field, value) => {
    setRows((prev) => prev.map((row) => (row.id === studentId ? { ...row, [field]: value } : row)))
  }

  const handleSaveRow = async (row) => {
    const validationError = validateRow(row)
    if (validationError) {
      setError(validationError)
      setSuccess("")
      return
    }

    setSavingId(row.id)
    setError("")
    setSuccess("")
    try {
      await setTimerForStudents({
        timerMode: row.timerMode,
        hours: row.hours,
        minutes: row.minutes,
        ids: [row.id],
      })
      setSuccess("Timer settings saved for student.")
    } catch (e) {
      setError("Unable to save timer settings right now.")
    } finally {
      setSavingId(null)
    }
  }

  const handleApplyAllTimer = async () => {
    if (!studentIds.length) return
    const validationError = validateGlobal()
    if (validationError) {
      setError(validationError)
      setSuccess("")
      return
    }
    setSavingAll(true)
    setError("")
    setSuccess("")
    try {
      await setTimerForStudents({
        timerMode: globalTimerMode,
        hours: globalHours,
        minutes: globalMinutes,
        ids: studentIds,
      })
      setRows((prev) => (
        prev.map((row) => ({
          ...row,
          timerMode: globalTimerMode,
          hours: globalHours,
          minutes: globalMinutes,
        }))
      ))
      setSuccess("Timer settings applied for all students.")
    } catch (e) {
      setError("Unable to save timer settings right now.")
    } finally {
      setSavingAll(false)
    }
  }

  const handleRemoveRowTimer = async (rowId) => {
    setSavingId(rowId)
    setError("")
    setSuccess("")
    try {
      await removeTimerForStudents([rowId])
      setRows((prev) => (
        prev.map((row) => (
          row.id === rowId ? { ...row, timerMode: "display", hours: "00", minutes: "00" } : row
        ))
      ))
      setSuccess("Timer removed for student.")
    } catch (e) {
      setError("Unable to remove timer settings right now.")
    } finally {
      setSavingId(null)
    }
  }

  const handleRemoveAllTimer = async () => {
    if (!rows.length) return
    setSavingAll(true)
    setError("")
    setSuccess("")
    try {
      await removeTimerForStudents(studentIds)
      setRows((prev) => prev.map((row) => ({ ...row, timerMode: "display", hours: "00", minutes: "00" })))
      setSuccess("Timer removed for all students.")
    } catch (e) {
      setError("Unable to remove timer settings right now.")
    } finally {
      setSavingAll(false)
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
      <div className="relative bg-white rounded-lg shadow-xl w-[96vw] max-w-6xl overflow-visible">
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
              onClick={handleRemoveAllTimer}
              disabled={!!savingId || loading || savingAll}
            >
              {savingAll ? "Removing..." : "Remove all timers"}
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

          <div className="mb-3">
            <div className="mb-2" style={{ fontWeight: 600, fontSize: 12 }}>
              Setup timer for all students
            </div>
            <div className="d-flex align-items-end flex-wrap" style={{ gap: 8 }}>
              <div style={{ minWidth: 190 }}>
                <label className="form-label mb-1">Timer mode</label>
                <select
                  className="form-control form-control-sm"
                  value={globalTimerMode}
                  onChange={(event) => setGlobalTimerMode(event.target.value)}
                  disabled={loading || !!savingId || savingAll}
                >
                  {TIMER_MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ minWidth: 110 }}>
                <label className="form-label mb-1">Hours</label>
                <select
                  className="form-control form-control-sm"
                  value={globalHours}
                  onChange={(event) => setGlobalHours(event.target.value)}
                  disabled={loading || !!savingId || savingAll}
                >
                  {hourOptions.map((hour) => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
              </div>
              <div style={{ minWidth: 110 }}>
                <label className="form-label mb-1">Minutes</label>
                <select
                  className="form-control form-control-sm"
                  value={globalMinutes}
                  onChange={(event) => setGlobalMinutes(event.target.value)}
                  disabled={loading || !!savingId || savingAll}
                >
                  {minuteOptions.map((minute) => (
                    <option key={minute} value={minute}>{minute}</option>
                  ))}
                </select>
              </div>
              <button
                className="primary-button px-3 py-2"
                style={{ fontSize: 12, height: 38 }}
                onClick={handleApplyAllTimer}
                disabled={loading || !!savingId || savingAll}
              >
                {savingAll ? "Applying..." : "Apply to all"}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by student name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ border: "1px solid #E5E7EB", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ maxHeight: 360, overflowY: "auto", overflowX: "auto" }}>
              <table className="table mb-0" style={{ fontSize: 12, minWidth: 980, tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "16%" }} />
                </colgroup>
                <thead style={{ backgroundColor: "#F3F4F6", position: "sticky", top: 0, zIndex: 2 }}>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Timer mode</th>
                    <th>Hours</th>
                    <th>Minutes</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={6} className="text-center py-3">Loading timer settings...</td>
                    </tr>
                  )}
                  {!loading && filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-3">No students found.</td>
                    </tr>
                  )}
                  {!loading && filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td style={{ verticalAlign: "middle" }}>{row.name}</td>
                      <td style={{ verticalAlign: "middle" }}>{row.email || "-"}</td>
                      <td>
                        <select
                          className="form-control form-control-sm"
                          value={row.timerMode}
                          onChange={(event) => handleRowChange(row.id, "timerMode", event.target.value)}
                          disabled={!!savingId || savingAll}
                          style={{ minWidth: 130 }}
                        >
                          {TIMER_MODE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="form-control form-control-sm"
                          value={row.hours}
                          onChange={(event) => handleRowChange(row.id, "hours", event.target.value)}
                          disabled={!!savingId || savingAll}
                          style={{ minWidth: 80 }}
                        >
                          {hourOptions.map((hour) => (
                            <option key={hour} value={hour}>{hour}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="form-control form-control-sm"
                          value={row.minutes}
                          onChange={(event) => handleRowChange(row.id, "minutes", event.target.value)}
                          disabled={!!savingId || savingAll}
                          style={{ minWidth: 80 }}
                        >
                          {minuteOptions.map((minute) => (
                            <option key={minute} value={minute}>{minute}</option>
                          ))}
                        </select>
                      </td>
                      <td className="text-right" style={{ verticalAlign: "middle" }}>
                        <div className="d-inline-flex align-items-center" style={{ gap: 8, whiteSpace: "nowrap" }}>
                          <button
                            className="secondary-button px-2 py-2"
                            style={{ fontSize: 12, minWidth: 72 }}
                            onClick={() => handleRemoveRowTimer(row.id)}
                            disabled={savingAll || (!!savingId && savingId !== row.id)}
                          >
                            {savingId === row.id ? "Removing..." : "Remove"}
                          </button>
                          <button
                            className="primary-button px-3 py-2"
                            style={{ fontSize: 12, minWidth: 64 }}
                            onClick={() => handleSaveRow(row)}
                            disabled={(!!savingId && savingId !== row.id) || savingAll}
                          >
                            {savingId === row.id ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <button
              className="secondary-button px-3 py-1 mr-2"
              style={{ fontSize: 12 }}
              onClick={onClose}
              disabled={!!savingId || savingAll}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonTimerModal
