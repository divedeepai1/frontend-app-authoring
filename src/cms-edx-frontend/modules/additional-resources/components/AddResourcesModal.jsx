import { useEffect, useRef, useState } from "react"
import { ChevronDown, FolderOpen, Upload as UploadIcon } from "lucide-react"
import TpLessonModalFrame from "../../lesson-modals/components/TpLessonModalFrame"
import * as resourcesApi from "../services/resourcesApi"
import { tpToast } from "../../../components/common/tpToast"

export default function AddResourcesModal({ isOpen, onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [categories, setCategories] = useState([])
  const [categoryMode, setCategoryMode] = useState("existing")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [title, setTitle] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  const categoryName = categoryMode === "new" ? newCategory.trim() : selectedCategory

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null)
      setUploadProgress(0)
      setIsUploading(false)
      setIsDragging(false)
      setError("")
      setTitle("")
      setCategoryMode("existing")
      setNewCategory("")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const list = await resourcesApi.fetchCategories()
        if (cancelled) return
        const names = (list || []).map((item) => item?.name).filter(Boolean)
        setCategories(names)
        setSelectedCategory((prev) => (prev && names.includes(prev) ? prev : names[0] || ""))
      } catch {
        if (!cancelled) {
          setCategories([])
          setSelectedCategory("")
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isOpen])

  const clearSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError("")
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    if (!categoryName) {
      const msg = "Select or create a category before uploading."
      setError(msg)
      tpToast.error(msg)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError("")
    try {
      await resourcesApi.uploadResource({
        file: selectedFile,
        category: categoryName,
        title,
        onProgress: setUploadProgress,
      })
      clearSelectedFile()
      tpToast.success(`"${title.trim() || selectedFile.name}" uploaded successfully`)
      onSuccess?.()
      onClose()
    } catch (err) {
      const msg = err?.message || "Unable to upload resource. Please try again."
      setError(msg)
      tpToast.error(msg)
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) onClose()
  }

  const onDragOver = (e) => {
    e.preventDefault()
    if (!isUploading) setIsDragging(true)
  }

  const onDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (isUploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError("")
    }
  }

  const footer = (
    <div className="tp-lesson-modal-footer-inner tp-lesson-modal-footer-inner--end">
      <button type="button" className="tp-btn tp-btn-outline" onClick={handleClose} disabled={isUploading}>
        Cancel
      </button>
      <button
        type="button"
        className="tp-btn tp-btn-primary"
        onClick={handleUpload}
        disabled={!selectedFile || !categoryName || isUploading}
      >
        {isUploading ? "Uploading…" : "Upload"}
      </button>
    </div>
  )

  return (
    <TpLessonModalFrame
      isOpen={isOpen}
      onClose={handleClose}
      title="Resources"
      icon={FolderOpen}
      size="md"
      footer={footer}
    >
      {error ? <div className="tp-lesson-modal-alert tp-lesson-modal-alert--error">{error}</div> : null}

      <div className="tp-res-add-section">
        <label className="tp-res-add-label" htmlFor="tp-res-category-mode">
          Category
        </label>
        <div className="tp-res-add-select-wrap">
          <select
            id="tp-res-category-mode"
            className="tp-res-add-select"
            value={categoryMode}
            onChange={(e) => setCategoryMode(e.target.value)}
            disabled={isUploading}
          >
            <option value="existing">Existing category</option>
            <option value="new">New category</option>
          </select>
          <ChevronDown className="tp-res-add-select-chevron" size={16} strokeWidth={2} aria-hidden />
        </div>
      </div>

      {categoryMode === "existing" ? (
        <div className="tp-res-add-section">
          <label className="tp-res-add-label" htmlFor="tp-res-category">
            Select category
          </label>
          <div className="tp-res-add-select-wrap">
            <select
              id="tp-res-category"
              className="tp-res-add-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={isUploading || !categories.length}
            >
              {!categories.length ? <option value="">No categories yet</option> : null}
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown className="tp-res-add-select-chevron" size={16} strokeWidth={2} aria-hidden />
          </div>
        </div>
      ) : (
        <div className="tp-res-add-section">
          <label className="tp-res-add-label" htmlFor="tp-res-new-category">
            New category name
          </label>
          <input
            id="tp-res-new-category"
            className="tp-res-add-select"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Posters"
            disabled={isUploading}
          />
        </div>
      )}

      <div className="tp-res-add-section">
        <label className="tp-res-add-label" htmlFor="tp-res-title">
          Title (optional)
        </label>
        <input
          id="tp-res-title"
          className="tp-res-add-select"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Defaults to file name"
          disabled={isUploading}
        />
      </div>

      <div className="tp-res-add-section">
        <span className="tp-res-add-label" id="tp-res-file-label">
          Select File
        </span>
        <input
          ref={fileInputRef}
          type="file"
          id="tp-res-file-upload"
          className="tp-res-add-file-input"
          onChange={handleFileSelect}
          disabled={isUploading}
          accept="*/*"
          aria-labelledby="tp-res-file-label"
        />
        <div
          className={`tp-res-add-dropzone${isDragging ? " tp-res-add-dropzone-active" : ""}${isUploading ? " tp-res-add-dropzone-disabled" : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {selectedFile ? (
            <div className="tp-res-add-file-picked">
              <UploadIcon className="tp-res-add-upload-icon" strokeWidth={2} aria-hidden />
              <p className="tp-res-add-file-name">{selectedFile.name}</p>
              <button type="button" className="tp-res-add-remove-file" onClick={clearSelectedFile} disabled={isUploading}>
                Remove file
              </button>
            </div>
          ) : (
            <label htmlFor="tp-res-file-upload" className={`tp-res-add-drop-label${isUploading ? " tp-res-add-drop-label-disabled" : ""}`}>
              <p className="tp-res-add-drop-hint">Click to select file</p>
            </label>
          )}
        </div>
      </div>

      {isUploading && uploadProgress > 0 ? (
        <div className="tp-res-add-progress-wrap">
          <div className="tp-res-add-progress-row">
            <span>Uploading…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="tp-res-add-progress-track">
            <div className="tp-res-add-progress-bar" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      ) : null}
    </TpLessonModalFrame>
  )
}
