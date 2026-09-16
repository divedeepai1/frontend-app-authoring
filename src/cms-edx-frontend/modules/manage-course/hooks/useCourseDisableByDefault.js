import { useCallback, useEffect, useRef, useState } from "react"
import * as courseDisableByDefaultApi from "../services/courseDisableByDefaultApi"

export function useCourseDisableByDefault(courseKey, classroomId) {
  const [disableByDefault, setDisableByDefault] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)

  const load = useCallback(async (nextCourseKey, nextClassroomId) => {
    const requestId = ++requestIdRef.current
    if (!nextCourseKey || !nextClassroomId) {
      setDisableByDefault(false)
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await courseDisableByDefaultApi.getCourseDisableByDefault(
        nextCourseKey,
        nextClassroomId
      )
      if (requestId !== requestIdRef.current) return
      setDisableByDefault(courseDisableByDefaultApi.parseDisableByDefault(data))
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setDisableByDefault(false)
      setError(err?.message || "Unable to load course preference.")
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    load(courseKey, classroomId)
  }, [courseKey, classroomId, load])

  const setPreference = useCallback(
    async (nextValue) => {
      if (!courseKey || !classroomId || saving) return

      const previous = disableByDefault
      setDisableByDefault(nextValue)
      setSaving(true)
      setError(null)

      try {
        const data = await courseDisableByDefaultApi.setCourseDisableByDefault(
          courseKey,
          classroomId,
          nextValue
        )
        setDisableByDefault(courseDisableByDefaultApi.parseDisableByDefault(data))
      } catch (err) {
        setDisableByDefault(previous)
        setError(err?.message || "Unable to update course preference.")
      } finally {
        setSaving(false)
      }
    },
    [courseKey, classroomId, disableByDefault, saving]
  )

  const toggle = useCallback(() => {
    setPreference(!disableByDefault)
  }, [disableByDefault, setPreference])

  return {
    disableByDefault,
    loading,
    saving,
    error,
    toggle,
    setPreference,
    reload: () => load(courseKey, classroomId),
  }
}
