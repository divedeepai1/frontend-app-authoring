import { useCallback, useEffect, useMemo, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import * as resourcesApi from "../services/resourcesApi"

export function useAdditionalResources() {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [resources, setResources] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [previewResource, setPreviewResource] = useState(null)

  const loadResources = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const payload = await resourcesApi.browseResources()
      setResources(resourcesApi.flattenBrowsePayload(payload))
      setCategories(resourcesApi.extractCategoryNames(payload))
    } catch {
      setResources([])
      setCategories([])
      setError("Unable to load resources.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const filteredResources = useMemo(() => {
    if (!Array.isArray(resources)) return []
    if (!selectedCategory || selectedCategory === "all") return resources
    return resources.filter((item) => String(item.category) === String(selectedCategory))
  }, [resources, selectedCategory])

  const handleView = useCallback((resource) => {
    if (!resource?.file_path) {
      tpToast.error("This resource has no file available.")
      return
    }
    setPreviewResource(resource)
  }, [])

  const handleDownload = useCallback(async (resource) => {
    if (!resource?.file_path) {
      tpToast.error("This resource has no file available.")
      return
    }
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
      window.open(resource.file_path, "_blank", "noopener,noreferrer")
      tpToast.info(`Opening ${resource.title || "resource"}`)
    }
  }, [])

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    filteredResources,
    isLoading,
    error,
    handleView,
    handleDownload,
    previewResource,
    setPreviewResource,
    loadResources,
  }
}
