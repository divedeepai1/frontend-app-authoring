import { useCallback, useEffect, useMemo, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import * as api from "../services/rubricSettingsApi"
import { mapStudentDisplay, normalizeStudentIds } from "../utils/students"
import {
  buildHourOptions,
  buildMinuteOptions,
  formatTwoDigits,
  hoursMinutesToSeconds,
  normalizeTimerPayload,
  secondsToHoursMinutes,
  validateTimerDuration,
  validateTimerMode,
} from "../utils/timer"
import { resolveRubricIds } from "../utils/rubricIds"

function mapStudentRows(timerItems, students) {
  const timerByStudent = {}
  timerItems.forEach((item) => {
    const studentId = item?.student_id ?? item?.user_id ?? item?.id
    if (studentId !== undefined && studentId !== null) timerByStudent[String(studentId)] = item
  })
  return (students || [])
    .map((student) => {
      const base = mapStudentDisplay(student)
      if (base.id === undefined || base.id === null) return null
      const timer = timerByStudent[String(base.id)] || {}
      const timeAllowed = Number(timer?.time_allowed)
      const parsed =
        Number.isInteger(timeAllowed) && timeAllowed > 0
          ? secondsToHoursMinutes(timeAllowed)
          : { hours: 0, minutes: 0 }
      return {
        ...base,
        timerMode: timer?.timer_mode === "display" || timer?.timer_mode === "lock" ? timer.timer_mode : "display",
        hours: formatTwoDigits(parsed.hours),
        minutes: formatTwoDigits(parsed.minutes),
      }
    })
    .filter(Boolean)
}

function getInitialGlobalTimer(timerItems, mappedRows) {
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
  return { mode: "display", hours: "00", minutes: "05" }
}

export function useLessonTimer({ isOpen, rubricId, rubricIds, students }) {
  const resolvedRubricIds = useMemo(
    () => resolveRubricIds({ rubricId, rubricIds }),
    [rubricId, rubricIds]
  )
  const rubricKey = resolvedRubricIds.join(",")

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

  const studentIds = useMemo(() => normalizeStudentIds(students), [students])
  const hourOptions = useMemo(buildHourOptions, [])
  const minuteOptions = useMemo(buildMinuteOptions, [])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => {
      const name = String(row.name || "").toLowerCase()
      const email = String(row.email || "").toLowerCase()
      return name.includes(query) || email.includes(query) || String(row.id).includes(query)
    })
  }, [rows, search])

  const load = useCallback(async () => {
    if (!resolvedRubricIds.length) return
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const json = await api.fetchRubricTimerState(resolvedRubricIds, studentIds)
      const timerItems = normalizeTimerPayload(json)
      const mappedRows = mapStudentRows(timerItems, students)
      const initial = getInitialGlobalTimer(timerItems, mappedRows)
      setRows(mappedRows)
      setGlobalTimerMode(initial.mode)
      setGlobalHours(initial.hours)
      setGlobalMinutes(initial.minutes)
    } catch {
      setError("Unable to load timer settings right now.")
    } finally {
      setLoading(false)
    }
  }, [resolvedRubricIds, studentIds, students])

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
    if (!resolvedRubricIds.length) {
      setError("Missing lesson information.")
      return
    }
    load()
  }, [isOpen, rubricKey, load, resolvedRubricIds.length])

  const setTimerForStudents = useCallback(
    async ({ timerMode, hours, minutes, ids }) => {
      await api.setRubricTimerState(
        resolvedRubricIds,
        hoursMinutesToSeconds(Number(hours), Number(minutes)),
        timerMode,
        ids
      )
    },
    [resolvedRubricIds]
  )

  const removeTimerForStudents = useCallback(
    async (ids) => {
      await api.setRubricTimerState(resolvedRubricIds, null, null, ids)
    },
    [resolvedRubricIds]
  )

  const handleRowChange = useCallback((studentId, field, value) => {
    setRows((prev) => prev.map((row) => (row.id === studentId ? { ...row, [field]: value } : row)))
  }, [])

  const handleSaveRow = useCallback(
    async (row) => {
      const durationError = validateTimerDuration(row.hours, row.minutes)
      const modeError = validateTimerMode(row.timerMode)
      if (durationError || modeError) {
        setError(durationError || modeError)
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
      } catch {
        setError("Unable to save timer settings right now.")
      } finally {
        setSavingId(null)
      }
    },
    [setTimerForStudents]
  )

  const handleApplyAllTimer = useCallback(async () => {
    if (!studentIds.length) return
    const durationError = validateTimerDuration(globalHours, globalMinutes)
    const modeError = validateTimerMode(globalTimerMode)
    if (durationError || modeError) {
      setError(durationError || modeError)
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
      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          timerMode: globalTimerMode,
          hours: globalHours,
          minutes: globalMinutes,
        }))
      )
      setSuccess("Timer settings applied for all students.")
      tpToast.success("Timer settings applied for all students")
    } catch {
      const msg = "Unable to save timer settings right now."
      setError(msg)
      tpToast.error(msg)
    } finally {
      setSavingAll(false)
    }
  }, [studentIds, globalHours, globalMinutes, globalTimerMode, setTimerForStudents])

  const handleRemoveRowTimer = useCallback(
    async (rowId) => {
      setSavingId(rowId)
      setError("")
      setSuccess("")
      try {
        await removeTimerForStudents([rowId])
        setRows((prev) =>
          prev.map((row) =>
            row.id === rowId ? { ...row, timerMode: "display", hours: "00", minutes: "00" } : row
          )
        )
        setSuccess("Timer removed for student.")
        tpToast.success("Timer removed for student")
      } catch {
        const msg = "Unable to remove timer settings right now."
        setError(msg)
        tpToast.error(msg)
      } finally {
        setSavingId(null)
      }
    },
    [removeTimerForStudents]
  )

  const handleRemoveAllTimer = useCallback(async () => {
    if (!rows.length) return
    setSavingAll(true)
    setError("")
    setSuccess("")
    try {
      await removeTimerForStudents(studentIds)
      setRows((prev) => prev.map((row) => ({ ...row, timerMode: "display", hours: "00", minutes: "00" })))
      setSuccess("Timer removed for all students.")
      tpToast.success("Timer removed for all students")
    } catch {
      const msg = "Unable to remove timer settings right now."
      setError(msg)
      tpToast.error(msg)
    } finally {
      setSavingAll(false)
    }
  }, [rows.length, studentIds, removeTimerForStudents])

  return {
    rows,
    filteredRows,
    search,
    setSearch,
    globalTimerMode,
    setGlobalTimerMode,
    globalHours,
    setGlobalHours,
    globalMinutes,
    setGlobalMinutes,
    hourOptions,
    minuteOptions,
    loading,
    savingId,
    savingAll,
    error,
    success,
    handleRowChange,
    handleSaveRow,
    handleApplyAllTimer,
    handleRemoveRowTimer,
    handleRemoveAllTimer,
  }
}
