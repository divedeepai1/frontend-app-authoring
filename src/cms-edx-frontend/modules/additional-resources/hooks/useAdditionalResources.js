import { useCallback, useEffect, useMemo, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import * as classroomApi from "../../manage-classes/services/classroomApi"
import * as resourcesApi from "../services/resourcesApi"

function mergeAllCourses(classrooms) {
  const all = []
  ;(classrooms || []).forEach((cls) => {
    if (cls.courses) all.push(...cls.courses)
  })
  return all
}

export function useAdditionalResources() {
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [resources, setResources] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState(null)
  const [isResourcesDialogOpen, setIsResourcesDialogOpen] = useState(false)

  const loadClasses = useCallback(async () => {
    try {
      const result = await classroomApi.fetchClassrooms()
      const cls = result?.classrooms || []
      setClasses(cls)
      setCourses(mergeAllCourses(cls))
      setSelectedCourseId("")
    } catch {
      setClasses([])
      setCourses([])
    }
  }, [])

  const loadResources = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await resourcesApi.fetchResourcesList()
      setResources(Array.isArray(data) ? data : [])
    } catch {
      setResources([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClasses()
    loadResources()
  }, [loadClasses, loadResources])

  useEffect(() => {
    if (!Array.isArray(classes) || classes.length === 0) return
    if (selectedClassId) {
      const found = classes.find((c) => String(c.id) === String(selectedClassId))
      setCourses(found?.courses || [])
      setSelectedCourseId("")
    } else {
      setCourses(mergeAllCourses(classes))
      setSelectedCourseId("")
    }
  }, [selectedClassId, classes])

  const filteredResources = useMemo(() => {
    if (!Array.isArray(resources)) return []
    let filtered = resources
    if (selectedCourseId) {
      filtered = resources.filter((r) => {
        const c = r?.course
        return c != null && String(c) === String(selectedCourseId)
      })
    } else if (selectedClassId) {
      filtered = resources.filter((r) => {
        const room = r?.classroom ?? r?.classroom_id ?? r?.class_id
        return room != null && String(room) === String(selectedClassId)
      })
    }
    return filtered
  }, [resources, selectedClassId, selectedCourseId])

  const handleDownload = useCallback(async (resource) => {
    if (!resource?.file_path) return
    try {
      const response = await fetch(resource.file_path)
      const blob = await response.blob()
      const filename = resource.title || "resource"
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
      tpToast.success(`Downloading ${resource.title || "resource"}`)
    } catch {
      window.open(resource.file_path, "_blank")
      tpToast.info(`Opening ${resource.title || "resource"}`)
    }
  }, [])

  const handleDeleteClick = useCallback((resource) => {
    setResourceToDelete(resource)
    setDeleteModalOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!resourceToDelete?.id) return
    const title = resourceToDelete.title
    try {
      await resourcesApi.deleteResourceById(resourceToDelete.id)
      await loadResources()
      setDeleteModalOpen(false)
      setResourceToDelete(null)
      tpToast.success(title ? `"${title}" deleted successfully` : "Resource deleted successfully")
    } catch (err) {
      tpToast.error(err?.message || "Unable to delete resource. Please try again.")
      throw err
    }
  }, [resourceToDelete, loadResources])

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false)
    setResourceToDelete(null)
  }, [])

  return {
    classes,
    courses,
    selectedClassId,
    selectedCourseId,
    setSelectedClassId,
    setSelectedCourseId,
    filteredResources,
    isLoading,
    deleteModalOpen,
    resourceToDelete,
    isResourcesDialogOpen,
    setIsResourcesDialogOpen,
    handleDownload,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    loadResources,
  }
}
