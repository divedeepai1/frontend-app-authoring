import { useCallback, useEffect, useMemo, useState } from "react"
import { tpToast } from "../../../components/common/tpToast"
import * as resourcesApi from "../services/resourcesApi"

function getFileName(resource) {
  const pathName = String(resource?.file_path || "")
  const fromPath = pathName.split("?")[0].split("#")[0].split("/").pop()
  if (fromPath) return decodeURIComponent(fromPath)
  const title = String(resource?.title || "").trim()
  return title || "resource"
}

function triggerDownloadFromBlob(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

function triggerDirectDownload(url, fileName) {
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.rel = "noopener noreferrer"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

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
    const fileName = getFileName(resource)
    try {
      const response = await fetch(resource.file_path, { credentials: "include" })
      if (!response.ok) throw new Error("download-failed")
      const blob = await response.blob()
      triggerDownloadFromBlob(blob, fileName)
      tpToast.success(`Downloading ${resource.title || "resource"}`)
    } catch {
      triggerDirectDownload(resource.file_path, fileName)
      tpToast.info(`Download started for ${resource.title || "resource"}`)
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
