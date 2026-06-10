import { useCallback, useEffect, useMemo, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import * as api from "../services/rubricSettingsApi"
import { normalizeStudentIds } from "../utils/students"
import { toIsoFromDateOnly, validateDateRange } from "../utils/dates"
import { buildScheduleRows, deriveBulkDatesFromRows } from "../utils/scheduleMapping"
import { resolveRubricIds } from "../utils/rubricIds"

export function useLessonSchedule({ isOpen, rubricId, rubricIds, students }) {
  const resolvedRubricIds = useMemo(
    () => resolveRubricIds({ rubricId, rubricIds }),
    [rubricId, rubricIds]
  )
  const rubricKey = resolvedRubricIds.join(",")
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
    if (!resolvedRubricIds.length || !studentIds.length) {
      setRows([])
      return
    }
    setLoading(true)
    setError("")
    try {
      const scheduleJson = await api.fetchRubricStatusDates(resolvedRubricIds, studentIds)
      const nextRows = buildScheduleRows(students, scheduleJson)
      setRows(nextRows)

      const { start, due } = deriveBulkDatesFromRows(nextRows)
      setBulkStart(start)
      setBulkDue(due)
    } catch {
      setError("Unable to load student schedules.")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [resolvedRubricIds, studentIds, students])

  useEffect(() => {
    if (!isOpen) {
      reset()
      return
    }
    if (!resolvedRubricIds.length) {
      setError("Missing lesson information.")
      return
    }
    load()
  }, [isOpen, rubricKey, load, reset, resolvedRubricIds.length])

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
    async (targetRows, startValue, dueValue, options = {}) => {
      const { applyAllFields = false, sendStart = false, sendDue = false } = options
      const message = validateDateRange(startValue, dueValue)
      if (message) throw new Error(message)

      const startIso = startValue ? toIsoFromDateOnly(startValue) : null
      const dueIso = dueValue ? toIsoFromDateOnly(dueValue) : null

      if (startValue && !startIso) throw new Error("Start date must be valid.")
      if (dueValue && !dueIso) throw new Error("Due date must be valid.")
      if (!applyAllFields && !startIso && !dueIso) {
        throw new Error("Enter a start date, due date, or both.")
      }
      if (applyAllFields && !startIso && !dueIso) {
        throw new Error("Enter a start date, due date, or both.")
      }

      await api.updateRubricStatusDates(
        resolvedRubricIds,
        startIso,
        dueIso,
        targetRows.map((r) => r.id),
        { applyAllFields, sendStart, sendDue }
      )
    },
    [resolvedRubricIds]
  )

  const handleSaveRow = useCallback(
    async (row) => {
      setSavingId(row.id)
      setError("")
      try {
        const startToSave = row.start || ""
        const dueToSave = row.due || ""
        await saveRows([row], startToSave, dueToSave, {
          sendStart: Boolean(startToSave),
          sendDue: true,
        })

        const scheduleJson = await api.fetchRubricStatusDates(resolvedRubricIds, studentIds)
        const refreshedRows = buildScheduleRows(students, scheduleJson)
        setRows(refreshedRows)
        const { start, due } = deriveBulkDatesFromRows(refreshedRows)
        setBulkStart(start)
        setBulkDue(due)

        tpToast.success("Access schedule saved for student")
      } catch (e) {
        const msg = e.message || "Unable to save schedule for this student."
        setError(msg)
        tpToast.error(msg)
      } finally {
        setSavingId(null)
      }
    },
    [resolvedRubricIds, studentIds, students, saveRows]
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
      await saveRows(rows, bulkStart, bulkDue, { applyAllFields: true })

      const scheduleJson = await api.fetchRubricStatusDates(resolvedRubricIds, studentIds)
      const refreshedRows = buildScheduleRows(students, scheduleJson)
      setRows(refreshedRows)
      setBulkStart(bulkStart)
      setBulkDue(bulkDue)
      setBulkOpen(false)
      tpToast.success("Access schedule saved for all students")
    } catch (e) {
      const msg = e.message || "Unable to save schedules for all students."
      setBulkError(msg)
      tpToast.error(msg)
    } finally {
      setSavingAll(false)
    }
  }, [rows, bulkStart, bulkDue, saveRows, resolvedRubricIds, studentIds, students])

  const openBulkModal = useCallback(() => {
    const { start, due } = deriveBulkDatesFromRows(rows)
    setBulkStart(start)
    setBulkDue(due)
    setBulkError("")
    setBulkOpen(true)
  }, [rows])

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
    openBulkModal,
  }
}
