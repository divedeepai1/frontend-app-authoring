import { useCallback, useEffect, useMemo, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import * as api from "../services/rubricSettingsApi"
import { mapStudentDisplay, normalizeStudentIds } from "../utils/students"
import {
  DEFAULT_AUTOMATIC_STARTING_FILE_LOAD,
  normalizeAutomaticStartingFileLoadPayload,
  resolveStudentEnabled,
} from "../utils/automaticStartingFileLoad"
import { resolveRubricIds } from "../utils/rubricIds"

function mapRows(students, studentMap, classEnabled) {
  return (students || [])
    .map((student) => {
      const base = mapStudentDisplay(student)
      if (base.id === undefined || base.id === null) return null
      return {
        ...base,
        enabled: resolveStudentEnabled(studentMap, base.id, classEnabled),
      }
    })
    .filter(Boolean)
}

export function useAutomaticStartingFileLoad({ isOpen, rubricId, rubricIds, students }) {
  const resolvedRubricIds = useMemo(
    () => resolveRubricIds({ rubricId, rubricIds }),
    [rubricId, rubricIds]
  )
  const rubricKey = resolvedRubricIds.join(",")
  const studentIds = useMemo(() => normalizeStudentIds(students), [students])

  const [classEnabled, setClassEnabled] = useState(DEFAULT_AUTOMATIC_STARTING_FILE_LOAD)
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [savingClass, setSavingClass] = useState(false)
  const [savingStudentId, setSavingStudentId] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => {
      const name = String(row.name || "").toLowerCase()
      const email = String(row.email || "").toLowerCase()
      return name.includes(query) || email.includes(query) || String(row.id).includes(query)
    })
  }, [rows, search])

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!resolvedRubricIds.length) return
      if (!silent) setLoading(true)
      setError("")
      setSuccess("")
      try {
        const json = await api.fetchAutomaticStartingFileLoad(resolvedRubricIds, studentIds)
        const normalized = normalizeAutomaticStartingFileLoadPayload(json)
        setClassEnabled(normalized.classEnabled)
        setRows(mapRows(students, normalized.studentMap, normalized.classEnabled))
      } catch {
        const msg = "Unable to load automatic starting file load settings right now."
        setError(msg)
        if (!silent) {
          setClassEnabled(DEFAULT_AUTOMATIC_STARTING_FILE_LOAD)
          setRows(mapRows(students, {}, DEFAULT_AUTOMATIC_STARTING_FILE_LOAD))
        }
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [resolvedRubricIds, studentIds, students]
  )

  useEffect(() => {
    if (!isOpen) {
      setClassEnabled(DEFAULT_AUTOMATIC_STARTING_FILE_LOAD)
      setRows([])
      setSearch("")
      setLoading(false)
      setSavingClass(false)
      setSavingStudentId(null)
      setError("")
      setSuccess("")
      return
    }
    load()
  }, [isOpen, rubricKey, load])

  const saveClassSetting = useCallback(async () => {
    if (!resolvedRubricIds.length || !studentIds.length) {
      const msg = studentIds.length
        ? "Unable to update settings right now."
        : "No students found in this class."
      setError(msg)
      tpToast.error(msg)
      return
    }
    setSavingClass(true)
    setError("")
    setSuccess("")
    try {
      await api.setAutomaticStartingFileLoad(resolvedRubricIds, classEnabled, studentIds)
      await load({ silent: true })
      const msg = classEnabled
        ? "Automatic starting file load enabled for the class."
        : "Automatic starting file load disabled for the class."
      setSuccess(msg)
      tpToast.success(msg)
    } catch {
      const msg = "Unable to update class starting file load settings right now."
      setError(msg)
      tpToast.error(msg)
    } finally {
      setSavingClass(false)
    }
  }, [resolvedRubricIds, classEnabled, studentIds, load])

  const saveStudentSetting = useCallback(
    async (studentId, enabled) => {
      if (!resolvedRubricIds.length || studentId === undefined || studentId === null) return
      setSavingStudentId(studentId)
      setError("")
      setSuccess("")
      try {
        await api.setAutomaticStartingFileLoad(resolvedRubricIds, enabled, [studentId])
        setRows((prev) =>
          prev.map((row) => (String(row.id) === String(studentId) ? { ...row, enabled } : row))
        )
        const msg = enabled
          ? "Automatic starting file load enabled for student."
          : "Automatic starting file load disabled for student."
        setSuccess(msg)
        tpToast.success(msg)
      } catch {
        const msg = "Unable to update student starting file load setting right now."
        setError(msg)
        tpToast.error(msg)
      } finally {
        setSavingStudentId(null)
      }
    },
    [resolvedRubricIds]
  )

  const setStudentEnabledLocal = useCallback((studentId, enabled) => {
    setRows((prev) =>
      prev.map((row) => (String(row.id) === String(studentId) ? { ...row, enabled } : row))
    )
  }, [])

  return {
    classEnabled,
    setClassEnabled,
    rows,
    filteredRows,
    search,
    setSearch,
    loading,
    savingClass,
    savingStudentId,
    error,
    success,
    saveClassSetting,
    saveStudentSetting,
    setStudentEnabledLocal,
  }
}
