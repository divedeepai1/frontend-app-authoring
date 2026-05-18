import { useCallback, useEffect, useMemo, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import * as api from "../services/rubricSettingsApi"
import { mapStudentDisplay, normalizeStudentIds } from "../utils/students"
import { toDateOnly, toIsoFromDateOnly, validateDateRange } from "../utils/dates"

export function useLessonSchedule({ isOpen, rubricId, students }) {
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

  const studentIds = useMemo(() => normalizeStudentIds(students), [students])

  const reset = useCallback(() => {
    setRows([])
    setError("")
    setSearch("")
    setBulkOpen(false)
    setBulkStart("")
    setBulkDue("")
    setBulkError("")
    setSavingId(null)
    setSavingAll(false)
  }, [])

  const load = useCallback(async () => {
    if (!rubricId || !studentIds.length) {
      setRows([])
      return
    }
    setLoading(true)
    setError("")
    try {
      const scheduleJson = await api.fetchRubricStatusDates(rubricId, studentIds)
      const byStudent = {}
      if (Array.isArray(scheduleJson)) {
        scheduleJson.forEach((item) => {
          byStudent[item.student_id] = item
        })
      }
      setRows(
        (students || []).map((s) => {
          const base = mapStudentDisplay(s)
          const existing = byStudent[base.id] || {}
          return {
            ...base,
            start: toDateOnly(existing.start_date),
            due: toDateOnly(existing.due_date),
          }
        })
      )
    } catch {
      setError("Unable to load student schedules.")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [rubricId, studentIds, students])

  useEffect(() => {
    if (!isOpen) {
      reset()
      return
    }
    if (!rubricId) {
      setError("Missing lesson information.")
      return
    }
    load()
  }, [isOpen, rubricId, load, reset])

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (r) =>
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        String(r.id).toLowerCase().includes(q)
    )
  }, [rows, search])

  const handleRowChange = useCallback((id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }, [])

  const saveRows = useCallback(
    async (targetRows, startValue, dueValue) => {
      const message = validateDateRange(startValue, dueValue)
      if (message) throw new Error(message)
      const startIso = toIsoFromDateOnly(startValue)
      const dueIso = toIsoFromDateOnly(dueValue)
      if (!startIso || !dueIso) throw new Error("Dates must be valid.")
      await api.updateRubricStatusDates(
        rubricId,
        startIso,
        dueIso,
        targetRows.map((r) => r.id)
      )
    },
    [rubricId]
  )

  const handleSaveRow = useCallback(
    async (row) => {
      setSavingId(row.id)
      setError("")
      try {
        await saveRows([row], row.start, row.due)
        tpToast.success("Access schedule saved for student")
      } catch (e) {
        const msg = e.message || "Unable to save schedule for this student."
        setError(msg)
        tpToast.error(msg)
      } finally {
        setSavingId(null)
      }
    },
    [saveRows]
  )

  const handleBulkSave = useCallback(async () => {
    if (!rows.length) {
      setBulkError("No students available.")
      return
    }
    setSavingAll(true)
    setBulkError("")
    setError("")
    try {
      await saveRows(rows, bulkStart, bulkDue)
      setRows((prev) => prev.map((r) => ({ ...r, start: bulkStart, due: bulkDue })))
      setBulkOpen(false)
      tpToast.success("Access schedule saved for all students")
    } catch (e) {
      const msg = e.message || "Unable to save schedules for all students."
      setBulkError(msg)
      tpToast.error(msg)
    } finally {
      setSavingAll(false)
    }
  }, [rows, bulkStart, bulkDue, saveRows])

  return {
    rows,
    filteredRows,
    loading,
    error,
    search,
    setSearch,
    bulkOpen,
    setBulkOpen,
    bulkStart,
    setBulkStart,
    bulkDue,
    setBulkDue,
    bulkError,
    savingId,
    savingAll,
    handleRowChange,
    handleSaveRow,
    handleBulkSave,
  }
}
