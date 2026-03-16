import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { base_url } from "../../../compugrade-constants"

const toDateTimeLocal = (isoString) => {
  if (!isoString) return ""
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const toIsoFromLocal = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

const LessonScheduleModal = ({ isOpen, onClose, courseId, title, students, rubricId }) => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkStart, setBulkStart] = useState("")
  const [bulkDue, setBulkDue] = useState("")
  const [bulkError, setBulkError] = useState("")
  const [savingId, setSavingId] = useState(null)
  const [savingAll, setSavingAll] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setRows([])
      setError("")
      setSearch("")
      setBulkOpen(false)
      setBulkStart("")
      setBulkDue("")
      setBulkError("")
      setSavingId(null)
      setSavingAll(false)
      return
    }
    if (!rubricId) {
      setError("Missing lesson information.")
      return
    }
    if (!Array.isArray(students) || !students.length) {
      setRows([])
      return
    }
    const fetchData = async () => {
      setLoading(true)
      setError("")
      try {
        const ids = students.map((s) => s.id)
        const scheduleRes = await fetch(`${base_url}/api/lms/get_rubric_status_dates`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rubric_openedx_based_id: rubricId,
            student_ids: ids,
          }),
        })
        if (!scheduleRes.ok) {
          const text = await scheduleRes.text()
          throw new Error(text || "Failed to fetch schedules.")
        }
        const scheduleJson = await scheduleRes.json()
        const byStudent = {}
        if (Array.isArray(scheduleJson)) {
          scheduleJson.forEach((item) => {
            byStudent[item.student_id] = item
          })
        }
        const mappedRows = students.map((s) => {
          const existing = byStudent[s.id] || {}
          return {
            id: s.id,
            name: s.name || s.full_name || s.email || `Student ${s.id}`,
            email: s.email || "",
            start: toDateTimeLocal(existing.start_date),
            due: toDateTimeLocal(existing.due_date),
          }
        })
        setRows(mappedRows)
      } catch (e) {
        setError("Unable to load student schedules.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isOpen, students, rubricId])

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((r) => {
      return (
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        String(r.id).toLowerCase().includes(q)
      )
    })
  }, [rows, search])

  const validateRange = (start, due) => {
    if (!start || !due) {
      return "Start date and due date are required."
    }
    const s = new Date(start)
    const d = new Date(due)
    if (Number.isNaN(s.getTime()) || Number.isNaN(d.getTime())) {
      return "Dates must be valid."
    }
    if (s > d) {
      return "Start date cannot be after due date."
    }
    return ""
  }

  const handleRowChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  const handleSaveRow = async (row) => {
    const message = validateRange(row.start, row.due)
    if (message) {
      setError(message)
      return
    }
    setSavingId(row.id)
    setError("")
    try {
      const startIso = toIsoFromLocal(row.start)
      const dueIso = toIsoFromLocal(row.due)
      if (!startIso || !dueIso) {
        setError("Dates must be valid.")
        setSavingId(null)
        return
      }
      const res = await fetch(`${base_url}/api/lms/update_rubric_status_dates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rubric_openedx_based_id: rubricId,
          start_date: startIso,
          due_date: dueIso,
          student_ids: [row.id],
        }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to update schedule.")
      }
    } catch (e) {
      setError("Unable to save schedule for this student.")
    } finally {
      setSavingId(null)
    }
  }

  const handleOpenBulk = () => {
    setBulkOpen(true)
    setBulkError("")
  }

  const handleBulkSave = async () => {
    const message = validateRange(bulkStart, bulkDue)
    if (message) {
      setBulkError(message)
      return
    }
    if (!rows.length) {
      setBulkError("No students available.")
      return
    }
    setSavingAll(true)
    setBulkError("")
    setError("")
    try {
      const startIso = toIsoFromLocal(bulkStart)
      const dueIso = toIsoFromLocal(bulkDue)
      if (!startIso || !dueIso) {
        setBulkError("Dates must be valid.")
        setSavingAll(false)
        return
      }
      const ids = rows.map((r) => r.id)
      const res = await fetch(`${base_url}/api/lms/update_rubric_status_dates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rubric_openedx_based_id: rubricId,
          start_date: startIso,
          due_date: dueIso,
          student_ids: ids,
        }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to update all schedules.")
      }
      setRows((prev) =>
        prev.map((r) => ({
          ...r,
          start: bulkStart,
          due: bulkDue,
        }))
      )
      setBulkOpen(false)
    } catch (e) {
      setBulkError("Unable to save schedules for all students.")
    } finally {
      setSavingAll(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 pt-[4%] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 border-none" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[92vw] max-w-4xl max-h-[85vh] overflow-hidden">
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
          <div>
            <div className="primary-text" style={{ fontWeight: 600, fontSize: 16 }}>
              Schedule lesson access
            </div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>
              {title || "Lesson"} 
            </div>
          </div>
          <div className="d-flex align-items-center">
            <button
              className="secondary-button px-3 py-1 mr-3"
              style={{ fontSize: 12, whiteSpace: "nowrap" }}
              onClick={handleOpenBulk}
            >
              Set access for all
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
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="flex-grow-1 mr-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {loading && (
              <span style={{ fontSize: 12, color: "#6B7280" }}>Loading schedules...</span>
            )}
          </div>
          {error && (
            <div className="alert alert-danger py-1 px-2 mb-2" style={{ fontSize: 12 }}>
              {error}
            </div>
          )}
          <div
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <table className="table mb-0" style={{ fontSize: 12 }}>
              <thead style={{ backgroundColor: "#F3F4F6" }}>
                <tr>
                  {/* <th style={{ minWidth: 140 }}>Student</th> */}
                  <th style={{ minWidth: 140 }}>Email</th>
                  {/* <th style={{ minWidth: 160 }}>Start date</th> */}
                  <th style={{ minWidth: 160 }}>Due date</th>
                  <th style={{ width: 110 }} className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
            </table>
            <div
              style={{
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              <table className="table mb-0" style={{ fontSize: 12 }}>
                <tbody>
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-3">
                        {loading ? "Loading..." : "No students found."}
                      </td>
                    </tr>
                  )}
                  {filteredRows.map((row) => (
                    <tr key={row.id}>
                      {/* <td style={{ minWidth: 140 }}>{row.name}</td> */}
                      <td style={{ minWidth: 140 }}>{row.email}</td>
                      {/* <td style={{ minWidth: 160 }}>
                        <input
                          type="datetime-local"
                          className="form-control form-control-sm"
                          value={row.start}
                          onChange={(e) =>
                            handleRowChange(row.id, "start", e.target.value)
                          }
                        />
                      </td> */}
                      <td style={{ minWidth: 140 }}>
                        <input
                          type="datetime-local"
                          className="form-control form-control-sm  mr-4"
                          value={row.due}
                          onChange={(e) =>
                            handleRowChange(row.id, "due", e.target.value)
                          }
                        />
                      </td>
                      <td style={{ width: 110 }} className="text-right">
                        <button
                          className="primary-button px-3 py-2 "
                          style={{
                            fontSize: 13,
                            opacity: savingId && savingId !== row.id ? 0.6 : 1,
                          }}
                          disabled={!!savingId && savingId !== row.id}
                          onClick={() => handleSaveRow(row)}
                        >
                          {savingId === row.id ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {bulkOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setBulkOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-xl w-[90vw] max-w-md">
              <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                <div className="primary-text" style={{ fontWeight: 600, fontSize: 15 }}>
                  Set schedule for all students
                </div>
                <div
                  className="p-1 rounded hover:bg-gray-100 border-none"
                  style={{ cursor: "pointer" }}
                  onClick={() => setBulkOpen(false)}
                >
                  <X className="w-5 h-5" />
                </div>
              </div>
              <div className="px-4 py-3" style={{ fontSize: 13 }}>
                {bulkError && (
                  <div className="alert alert-danger py-1 px-2 mb-2" style={{ fontSize: 12 }}>
                    {bulkError}
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label mb-1">Start date</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={bulkStart}
                    onChange={(e) => setBulkStart(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label mb-1">Due date</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={bulkDue}
                    onChange={(e) => setBulkDue(e.target.value)}
                  />
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <button
                    className="secondary-button px-3 py-1 mr-2"
                    style={{ fontSize: 12 }}
                    onClick={() => setBulkOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="primary-button px-3 py-2"
                    style={{ fontSize: 12 }}
                    onClick={handleBulkSave}
                    disabled={savingAll}
                  >
                    {savingAll ? "Saving..." : "Save for all"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonScheduleModal

