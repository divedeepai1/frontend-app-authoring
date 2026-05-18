import { useCallback, useEffect, useMemo, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import * as api from "../services/rubricSettingsApi"
import { mapStudentDisplay, normalizeStudentIds } from "../utils/students"
import {
  buildAttemptOptions,
  getRubricAttemptsAllotted,
  MAX_ATTEMPTS,
  MIN_ATTEMPTS,
  normalizeAttemptsPayload,
  toStudentAttemptMap,
} from "../utils/attempts"

export function useLessonAttempts({ isOpen, rubricId, students }) {
  const [maxAttempts, setMaxAttempts] = useState(1)
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [savingClass, setSavingClass] = useState(false)
  const [savingStudentId, setSavingStudentId] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const attemptOptions = useMemo(buildAttemptOptions, [])
  const studentIds = useMemo(() => normalizeStudentIds(students), [students])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => {
      const name = String(row.name || "").toLowerCase()
      const email = String(row.email || "").toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }, [rows, search])

  const loadAttempts = useCallback(
    async ({ silent = false } = {}) => {
      if (!rubricId) return
      if (!silent) setLoading(true)
      setError("")
      setSuccess("")
      try {
        const json = await api.fetchRubricNumAttempts(rubricId, studentIds)
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
        setRows(
          (students || []).map((student) => {
            const base = mapStudentDisplay(student)
            const id = String(base.id)
            const allottedValue = studentAttemptMap[id]?.allotted
            const numberOfAttemptsValue = studentAttemptMap[id]?.numberOfAttempts
            const attemptsAllotted =
              allottedValue === null
                ? null
                : Number.isInteger(allottedValue) && allottedValue >= MIN_ATTEMPTS
                  ? Math.min(allottedValue, MAX_ATTEMPTS)
                  : safeClassMax
            const numberOfAttempts =
              numberOfAttemptsValue === null
                ? null
                : Number.isInteger(numberOfAttemptsValue) && numberOfAttemptsValue >= 0
                  ? Math.min(numberOfAttemptsValue, MAX_ATTEMPTS)
                  : attemptsAllotted
            return { ...base, attemptsAllotted, numberOfAttempts }
          })
        )
      } catch {
        setError("Unable to load attempt settings right now.")
        if (!silent) {
          setMaxAttempts(1)
          setRows(
            (students || []).map((student) => {
              const base = mapStudentDisplay(student)
              return { ...base, attemptsAllotted: 1, numberOfAttempts: 1 }
            })
          )
        }
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [rubricId, studentIds, students]
  )

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
  }, [isOpen, loadAttempts])

  const saveClassAttempts = useCallback(async () => {
    if (!rubricId) return
    setSavingClass(true)
    setError("")
    setSuccess("")
    const classNumOfAttempts = maxAttempts === "unlimited" ? null : maxAttempts
    try {
      await api.setRubricNumAttempts(rubricId, classNumOfAttempts, classNumOfAttempts, studentIds)
      await loadAttempts({ silent: true })
      setSuccess("Lesson attempts updated for class.")
      tpToast.success("Lesson attempts updated for class")
    } catch {
      const msg = "Unable to update class attempts right now."
      setError(msg)
      tpToast.error(msg)
    } finally {
      setSavingClass(false)
    }
  }, [rubricId, maxAttempts, studentIds, loadAttempts])

  const saveStudentAttempts = useCallback(
    async (studentId, studentAttemptsAllotted, nextNumOfAttempts) => {
      if (!rubricId) return
      const boundedAllotted =
        studentAttemptsAllotted === null
          ? null
          : Math.max(MIN_ATTEMPTS, Math.min(MAX_ATTEMPTS, studentAttemptsAllotted))
      const boundedNumOfAttempts =
        nextNumOfAttempts === null ? null : Math.max(0, Math.min(MAX_ATTEMPTS, nextNumOfAttempts))
      setSavingStudentId(studentId)
      setError("")
      setSuccess("")
      try {
        await api.setRubricNumAttempts(rubricId, boundedAllotted, boundedNumOfAttempts, [studentId])
        await loadAttempts({ silent: true })
        setSuccess("Student attempts updated.")
        tpToast.success("Student attempts updated")
      } catch {
        const msg = "Unable to update student attempts right now."
        setError(msg)
        tpToast.error(msg)
      } finally {
        setSavingStudentId(null)
      }
    },
    [rubricId, loadAttempts]
  )

  return {
    maxAttempts,
    setMaxAttempts,
    rows,
    filteredRows,
    search,
    setSearch,
    attemptOptions,
    loading,
    savingClass,
    savingStudentId,
    error,
    success,
    saveClassAttempts,
    saveStudentAttempts,
  }
}
