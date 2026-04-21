import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { base_url } from "../../../compugrade-constants"

const MIN_ATTEMPTS = 1
const MAX_ATTEMPTS = 20

const buildAttemptOptions = () =>
  Array.from({ length: MAX_ATTEMPTS - MIN_ATTEMPTS + 1 }, (_, idx) => MIN_ATTEMPTS + idx)

const normalizeAttemptsPayload = (payload) => {
  if (!payload) return null
  if (Array.isArray(payload)) return payload
  if (typeof payload === "object") {
    if (Array.isArray(payload.data)) return payload.data
    if (payload.data && typeof payload.data === "object") return payload.data
    if (Array.isArray(payload.results)) return payload.results
    return payload
  }
  return null
}

const parseAttemptEntry = (entry) => {
  const toNullableNumber = (value) => {
    if (value === null || value === undefined) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  if (entry && typeof entry === "object") {
    const allottedRaw =
      entry.num_of_attempts ??
      entry.attempts ??
      entry.attempts_allowed ??
      entry.max_attempts ??
      null
    const numberOfAttemptsRaw =
      entry.num_of_attempts ??
      entry.attempts ??
      entry.number_of_attempts ??
      entry.remaining_attempts ??
      entry.attempts_remaining ??
      entry.remaining ??
      allottedRaw
    return {
      allotted: toNullableNumber(allottedRaw),
      numberOfAttempts: toNullableNumber(numberOfAttemptsRaw),
    }
  }
  const value = toNullableNumber(entry)
  return {
    allotted: value,
    numberOfAttempts: value,
  }
}

const toStudentAttemptMap = (data) => {
  if (!data || typeof data !== "object") return {}
  if (Array.isArray(data)) {
    return data.reduce((acc, entry) => {
      const id = entry?.student_id ?? entry?.id ?? entry?.user_id ?? entry?.studentId
      if (id !== undefined && id !== null) {
        acc[String(id)] = parseAttemptEntry(entry)
      }
      return acc
    }, {})
  }
  if (data.attempts_by_student && typeof data.attempts_by_student === "object") {
    return Object.keys(data.attempts_by_student).reduce((acc, key) => {
      acc[key] = parseAttemptEntry(data.attempts_by_student[key])
      return acc
    }, {})
  }
  if (data.student_attempts && typeof data.student_attempts === "object") {
    return Object.keys(data.student_attempts).reduce((acc, key) => {
      acc[key] = parseAttemptEntry(data.student_attempts[key])
      return acc
    }, {})
  }
  if (Array.isArray(data.students)) {
    return data.students.reduce((acc, student) => {
      const id = student?.id ?? student?.user_id ?? student?.student_id
      if (id !== undefined && id !== null) {
        acc[String(id)] = parseAttemptEntry(student)
      }
      return acc
    }, {})
  }
  return {}
}

const getRubricAttemptsAllotted = (data) => {
  if (Array.isArray(data)) {
    const firstFound = data.find((entry) => {
      const value = Number(entry?.attempts_allotted)
      return Number.isInteger(value) && value >= MIN_ATTEMPTS
    })
    return firstFound ? Number(firstFound.attempts_allotted) : null
  }
  if (data && typeof data === "object") {
    const value = Number(
      data.attempts_allotted ??
      data.attempt_limit ??
      data.max_attempts ??
      data.num_of_attempts
    )
    return Number.isInteger(value) && value >= MIN_ATTEMPTS ? value : null
  }
  return null
}

const LessonAttemptsModal = ({ isOpen, onClose, title, rubricId, students }) => {
  const [maxAttempts, setMaxAttempts] = useState(1)
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [savingClass, setSavingClass] = useState(false)
  const [savingStudentId, setSavingStudentId] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const attemptOptions = useMemo(buildAttemptOptions, [])
  const studentIds = useMemo(
    () => (Array.isArray(students) ? students.map((student) => student.id) : []),
    [students]
  )
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => {
      const name = String(row.name || "").toLowerCase()
      const email = String(row.email || "").toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }, [rows, search])

  const loadAttempts = async ({ silent = false } = {}) => {
    if (!rubricId) return
    if (!silent) setLoading(true)
    setError("")
    setSuccess("")
    try {
      const response = await fetch(`${base_url}/api/lms/get_rubric_num_attempts`, {
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
        throw new Error(text || "Failed to load attempts.")
      }
      const json = await response.json()
      const data = normalizeAttemptsPayload(json)
      const loadedClassMax = getRubricAttemptsAllotted(data)
      const parsedClassMax = Number(loadedClassMax)
      const safeClassMax =
        loadedClassMax === null
          ? "unlimited"
          : Number.isInteger(parsedClassMax) && parsedClassMax >= MIN_ATTEMPTS
          ? Math.min(parsedClassMax, MAX_ATTEMPTS)
          : 1
      setMaxAttempts(safeClassMax)

      const studentAttemptMap = toStudentAttemptMap(data)
      const mappedRows = (students || []).map((student) => {
        const id = String(student.id)
        const combinedName = `${student.first_name || ""} ${student.last_name || ""}`.trim()
        const rawName = student.name || student.full_name || combinedName
        const email = student.email || ""
        const fallbackName = email.includes("@") ? email.split("@")[0] : `Student ${student.id}`
        const allottedValue = studentAttemptMap[id]?.allotted
        const numberOfAttemptsValue = studentAttemptMap[id]?.numberOfAttempts
        const attemptsAllotted =
          allottedValue === null
            ? null
            :
          Number.isInteger(allottedValue) && allottedValue >= MIN_ATTEMPTS
            ? Math.min(allottedValue, MAX_ATTEMPTS)
            : safeClassMax
        const numberOfAttempts =
          numberOfAttemptsValue === null
            ? null
            :
          Number.isInteger(numberOfAttemptsValue) && numberOfAttemptsValue >= 0
            ? Math.min(numberOfAttemptsValue, MAX_ATTEMPTS)
            : attemptsAllotted
        return {
          id: student.id,
          name: rawName || fallbackName,
          email,
          attemptsAllotted,
          numberOfAttempts,
        }
      })
      setRows(mappedRows)
    } catch (e) {
      setError("Unable to load attempt settings right now.")
      if (!silent) {
        setMaxAttempts(1)
        setRows(
          (students || []).map((student) => ({
            id: student.id,
            name:
              student.name ||
              student.full_name ||
              `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
              (student.email || "").split("@")[0] ||
              `Student ${student.id}`,
            email: student.email || "",
            attemptsAllotted: 1,
            numberOfAttempts: 1,
          }))
        )
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setMaxAttempts(1)
      setRows([])
      setSearch("")
      setLoading(false)
      setSavingClass(false)
      setSavingStudentId(null)
      setError("")
      setSuccess("")
      return
    }
    loadAttempts()
  }, [isOpen, rubricId, studentIds, students])

  const saveClassAttempts = async () => {
    if (!rubricId) return
    setSavingClass(true)
    setError("")
    setSuccess("")
    const classNumOfAttempts = maxAttempts === "unlimited" ? null : maxAttempts
    try {
      const response = await fetch(`${base_url}/api/lms/set_rubric_num_attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rubric_openedx_based_id: rubricId,
          attempts_allotted: classNumOfAttempts,
          num_of_attempts: classNumOfAttempts,
          student_ids: studentIds,
        }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Failed to save class attempts.")
      }
      await loadAttempts({ silent: true })
      setSuccess("Lesson attempts updated for class.")
    } catch (e) {
      setError("Unable to update class attempts right now.")
    } finally {
      setSavingClass(false)
    }
  }

  const saveStudentAttempts = async (studentId, studentAttemptsAllotted, nextNumOfAttempts) => {
    if (!rubricId) return
    const boundedAllotted =
      studentAttemptsAllotted === null
        ? null
        : Math.max(MIN_ATTEMPTS, Math.min(MAX_ATTEMPTS, studentAttemptsAllotted))
    const boundedNumOfAttempts =
      nextNumOfAttempts === null
        ? null
        : Math.max(0, Math.min(MAX_ATTEMPTS, nextNumOfAttempts))
    setSavingStudentId(studentId)
    setError("")
    setSuccess("")
    try {
      const response = await fetch(`${base_url}/api/lms/set_rubric_num_attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rubric_openedx_based_id: rubricId,
          attempts_allotted: boundedAllotted,
          num_of_attempts: boundedNumOfAttempts,
          student_ids: [studentId],
        }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Failed to update student attempts.")
      }
      await loadAttempts({ silent: true })
      setSuccess("Student attempts updated.")
    } catch (e) {
      setError("Unable to update student attempts right now.")
    } finally {
      setSavingStudentId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 pt-[4%] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 border-none" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[96vw] max-w-6xl overflow-hidden">
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
          <div>
            <div className="primary-text" style={{ fontWeight: 600, fontSize: 16 }}>
              Lesson attempts setup
            </div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>{title || "Lesson"}</div>
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
          {success && (
            <div className="alert alert-success py-1 px-2 mb-3" style={{ fontSize: 12 }}>
              {success}
            </div>
          )}

          <div className="d-flex align-items-end mb-3" style={{ gap: 12 }}>
            <div style={{ minWidth: 220 }}>
              <label className="form-label mb-1" style={{ fontWeight: 500 }}>
                Max attempts for this lesson
              </label>
              <select
                className="form-control"
                value={maxAttempts}
                onChange={(event) => {
                  const value = event.target.value
                  setMaxAttempts(value === "unlimited" ? "unlimited" : Number(value))
                }}
                disabled={loading || savingClass || !!savingStudentId}
              >
                {attemptOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
                <option value="unlimited">Unlimited Attempts</option>
              </select>
            </div>
            <button
              className="primary-button px-3 py-2"
              style={{ fontSize: 12, height: 38 }}
              onClick={saveClassAttempts}
              disabled={loading || savingClass || !!savingStudentId}
            >
              {savingClass ? "Saving..." : "Save for class"}
            </button>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search student here by name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              disabled={loading || savingClass || !!savingStudentId}
            />
          </div>

          <div style={{ border: "1px solid #E5E7EB", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ maxHeight: 260, overflowY: "auto", overflowX: "hidden" }}>
              <table className="table mb-0" style={{ fontSize: 12, tableLayout: "fixed", width: "100%" }}>
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "28%" }} />
                </colgroup>
                <thead style={{ backgroundColor: "#F3F4F6", position: "sticky", top: 0, zIndex: 2 }}>
                  <tr>
                    <th style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Student</th>
                    <th style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Email</th>
                    <th style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Attempts allotted</th>
                    <th style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Number of attempts</th>
                    <th style={{ textAlign: "right", paddingRight: 12 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-3">
                        Loading attempts...
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name || "-"}</td>
                        <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.email || "-"}</td>
                        <td>{row.attemptsAllotted === null ? "Unlimited Attempts" : row.attemptsAllotted}</td>
                        <td>{row.numberOfAttempts === null ? "Unlimited Attempts" : row.numberOfAttempts}</td>
                        <td style={{ textAlign: "right", paddingRight: 12 }}>
                          <div
                            className="d-inline-flex align-items-center justify-content-end"
                            style={{ gap: 6, width: "100%", flexWrap: "nowrap" }}
                          >
                          <button
                            className="secondary-button px-2 py-1"
                            style={{ fontSize: 12, minWidth: 40, whiteSpace: "nowrap", paddingLeft: 8, paddingRight: 8 }}
                            disabled={
                              savingClass ||
                              savingStudentId === row.id ||
                              row.numberOfAttempts === null ||
                              row.numberOfAttempts >= MAX_ATTEMPTS
                            }
                            onClick={() =>
                              saveStudentAttempts(
                                row.id,
                                (row.numberOfAttempts || 0) + 1,
                                (row.numberOfAttempts || 0) + 1
                              )
                            }
                          >
                            Add
                          </button>
                          <button
                            className="primary-button px-2 py-1"
                            style={{ fontSize: 12, minWidth: 112, whiteSpace: "nowrap", paddingLeft: 8, paddingRight: 8 }}
                            disabled={savingClass || savingStudentId === row.id}
                            onClick={() =>
                              saveStudentAttempts(
                                row.id,
                                maxAttempts === "unlimited" ? null : maxAttempts,
                                maxAttempts === "unlimited" ? null : maxAttempts
                              )
                            }
                          >
                            Reset attempts
                          </button>
                          <button
                            className="secondary-button px-2 py-1"
                            style={{ fontSize: 12, minWidth: 122, whiteSpace: "nowrap", paddingLeft: 8, paddingRight: 8 }}
                            disabled={savingClass || savingStudentId === row.id || row.numberOfAttempts === null}
                            onClick={() => saveStudentAttempts(row.id, null, null)}
                          >
                            Unlimited Attempts
                          </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {!loading && filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-3">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonAttemptsModal
