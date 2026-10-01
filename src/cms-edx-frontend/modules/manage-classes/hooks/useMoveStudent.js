import { useCallback, useEffect, useMemo, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import * as classroomApi from "../services/classroomApi"
import { resetStudentProgress } from "../services/studentProgressApi"
import { getCarryOverState } from "../utils/courseOverlap"
import { getEligibleTargetClasses } from "../utils/eligibleTargetClasses"

const INITIAL_STATE = {
  isOpen: false,
  student: null,
  targetClassId: "",
  includeGrades: false,
  submitting: false,
  error: "",
}

/**
 * Move-student modal state and submit flow for the View Class students table.
 *
 * @param {{
 *   sourceClassId: number|string,
 *   sourceClass: object|null,
 *   onMoved?: () => void | Promise<void>,
 * }} options
 */
export function useMoveStudent({ sourceClassId, sourceClass, onMoved }) {
  const [state, setState] = useState(INITIAL_STATE)
  const [classrooms, setClassrooms] = useState([])
  const [loadingTargets, setLoadingTargets] = useState(false)

  const eligibleTargets = useMemo(
    () => getEligibleTargetClasses(classrooms, sourceClassId),
    [classrooms, sourceClassId]
  )

  // Prefer live classroom payload (with courses) when available; fall back to session meta.
  const resolvedSourceClass = useMemo(() => {
    const fromList = classrooms.find((cls) => String(cls.id) === String(sourceClassId))
    return fromList || sourceClass || null
  }, [classrooms, sourceClassId, sourceClass])

  const selectedTarget = useMemo(
    () => eligibleTargets.find((cls) => String(cls.id) === String(state.targetClassId)) || null,
    [eligibleTargets, state.targetClassId]
  )

  const carryOver = useMemo(
    () =>
      getCarryOverState(resolvedSourceClass, selectedTarget, {
        hasTarget: Boolean(selectedTarget),
      }),
    [resolvedSourceClass, selectedTarget]
  )

  const loadTargets = useCallback(async () => {
    setLoadingTargets(true)
    try {
      const result = await classroomApi.fetchClassrooms()
      setClassrooms(result?.classrooms ?? [])
    } catch {
      setClassrooms([])
    } finally {
      setLoadingTargets(false)
    }
  }, [])

  useEffect(() => {
    if (!state.isOpen) return undefined
    loadTargets()
    return undefined
  }, [state.isOpen, loadTargets])

  // Keep includeGrades in sync with course-overlap rules when the target changes.
  useEffect(() => {
    if (!state.isOpen) {
      return
    }
    const nextInclude = carryOver.canCarryOver ? carryOver.includeGradesDefault : false
    setState((prev) => (
      prev.includeGrades === nextInclude ? prev : { ...prev, includeGrades: nextInclude }
    ))
  }, [state.isOpen, state.targetClassId, carryOver.canCarryOver, carryOver.includeGradesDefault])

  const openMove = useCallback((student) => {
    if (!student) return
    setState({
      ...INITIAL_STATE,
      isOpen: true,
      student,
    })
  }, [])

  const closeMove = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  const setTargetClassId = useCallback((value) => {
    setState((prev) => ({
      ...prev,
      targetClassId: value,
      error: "",
    }))
  }, [])

  const setIncludeGrades = useCallback((checked) => {
    setState((prev) => {
      if (!carryOver.canCarryOver) {
        return { ...prev, includeGrades: false }
      }
      return { ...prev, includeGrades: Boolean(checked), error: "" }
    })
  }, [carryOver.canCarryOver])

  const submitMove = useCallback(async () => {
    const email = String(state.student?.email || "").trim()
    const destinationId = state.targetClassId

    if (!email) {
      setState((prev) => ({ ...prev, error: "Student email is required to move this student." }))
      return
    }
    if (!destinationId) {
      setState((prev) => ({ ...prev, error: "Select a target class before confirming the move." }))
      return
    }
    if (!sourceClassId) {
      setState((prev) => ({ ...prev, error: "Source class is missing. Close and try again." }))
      return
    }

    const includeGrades = carryOver.canCarryOver ? Boolean(state.includeGrades) : false

    setState((prev) => ({ ...prev, submitting: true, error: "" }))
    try {
      await classroomApi.changeStudentClass({
        email,
        sourceClassroomId: sourceClassId,
        destinationClassroomId: destinationId,
      })

      // Carry-over toggle is local only: when false, clear progress via reset API.
      if (!includeGrades && state.student?.id != null) {
        try {
          await resetStudentProgress(state.student.id)
        } catch {
          // Move already succeeded; surface reset failure as toast only (not blocking).
          tpToast.error(
            "Progress reset incomplete",
            "Student was moved, but progress could not be reset automatically."
          )
        }
      }

      setState(INITIAL_STATE)
      tpToast.success("Student moved", "The student was moved to the target class.")
      if (typeof onMoved === "function") {
        await onMoved()
      }
    } catch (err) {
      // Inline error only — do not toast move API failures.
      setState((prev) => ({
        ...prev,
        submitting: false,
        error: err?.message || "Failed to move student. Please try again.",
      }))
    }
  }, [
    state.student,
    state.targetClassId,
    state.includeGrades,
    sourceClassId,
    carryOver.canCarryOver,
    onMoved,
  ])

  return {
    isOpen: state.isOpen,
    student: state.student,
    targetClassId: state.targetClassId,
    includeGrades: carryOver.canCarryOver ? state.includeGrades : false,
    canCarryOver: carryOver.canCarryOver,
    carryOverHelperText: carryOver.helperText,
    submitting: state.submitting,
    error: state.error,
    eligibleTargets,
    loadingTargets,
    openMove,
    closeMove,
    setTargetClassId,
    setIncludeGrades,
    submitMove,
  }
}
