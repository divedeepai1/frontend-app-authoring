import { useCallback, useEffect, useMemo, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import * as classroomApi from "../services/classroomApi"
import { partitionClassrooms } from "../utils/classStatus"

export function useClassesList() {
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadClassrooms = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      const result = await classroomApi.fetchClassrooms()
      setClassrooms(result?.classrooms ?? [])
    } catch (err) {
      setClassrooms([])
      if (!silent) {
        tpToast.error(err?.message || "Unable to load classes. Please try again.")
      }
      throw err
    } finally {
      if (!silent) setLoading(false)
      else setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadClassrooms().catch(() => {})
  }, [loadClassrooms])

  const { active, archived } = useMemo(() => partitionClassrooms(classrooms), [classrooms])

  const archiveClass = useCallback(
    async (classId) => {
      await classroomApi.archiveClassroom(classId)
      await loadClassrooms({ silent: true })
      tpToast.success("Class archived successfully")
    },
    [loadClassrooms]
  )

  const unarchiveClass = useCallback(
    async (classId) => {
      await classroomApi.unarchiveClassroom(classId)
      await loadClassrooms({ silent: true })
      tpToast.success("Class restored successfully")
    },
    [loadClassrooms]
  )

  const deleteClass = useCallback(
    async (classId) => {
      await classroomApi.deleteClassroom(classId)
      setClassrooms((prev) => prev.filter((cls) => String(cls.id) !== String(classId)))
      tpToast.success("Class deleted successfully")
    },
    []
  )

  return {
    classrooms,
    activeClassrooms: active,
    archivedClassrooms: archived,
    loading,
    refreshing,
    reloadClassrooms: loadClassrooms,
    archiveClass,
    unarchiveClass,
    deleteClass,
  }
}
