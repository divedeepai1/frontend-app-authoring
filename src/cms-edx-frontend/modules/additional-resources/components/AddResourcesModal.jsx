import { useEffect, useRef, useState } from "react"
import { ChevronDown, FolderOpen, Upload as UploadIcon } from "lucide-react"
import TpLessonModalFrame from "../../lesson-modals/components/TpLessonModalFrame"
import * as resourcesApi from "../services/resourcesApi"
import { tpToast } from "../../../components/common/tpToast"

export default function AddResourcesModal({ isOpen, onClose, classId, courseId, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadType, setUploadType] = useState("general")
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null)
      setUploadProgress(0)
      setIsUploading(false)
      setIsDragging(false)
      setError("")
      setUploadType("general")
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }
    if (!classId) setUploadType("general")
  }, [isOpen, classId])

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
    if (uploadType === "class" && !classId) {
      const msg = "Select a class in the filters before uploading by class."
      setError(msg)
      tpToast.error(msg)
      return
    }
    if (uploadType === "course" && !courseId) {
      const msg = "Select a course in the filters before uploading by course."
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
        uploadType,
        classId,
        courseId,
        onProgress: setUploadProgress,
      })
      clearSelectedFile()
      tpToast.success(`"${selectedFile.name}" uploaded successfully`)
      onSuccess?.()
      onClose()
    } catch {
      const msg = "Unable to upload resource. Please try again."
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
        disabled={!selectedFile || isUploading}
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
        <label htmlFor="tp-res-upload-type" className="tp-res-add-label">
          Upload Type:
        </label>
        <div className="tp-res-add-select-wrap">
          <select
            id="tp-res-upload-type"
            className="tp-res-add-select"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            disabled={isUploading}
          >
            <option value="general">General Resource</option>
            {classId ? <option value="class">Upload resource by class</option> : null}
            {courseId ? <option value="course">Upload resource by course</option> : null}
          </select>
          <ChevronDown className="tp-res-add-select-chevron" size={16} strokeWidth={2} aria-hidden />
        </div>
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
