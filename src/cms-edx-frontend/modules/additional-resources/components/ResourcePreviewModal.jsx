import TpLessonModalFrame from "../../lesson-modals/components/TpLessonModalFrame"
import { Eye } from "lucide-react"

function getExtension(resource) {
  const source = String(resource?.title || resource?.file_path || "").toLowerCase()
  const match = source.match(/\.([a-z0-9]+)(?:[\?#].*)?$/)
  return match?.[1] || ""
}

function getPreviewType(resource) {
  const ext = getExtension(resource)
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext)) return "image"
  if (ext === "pdf") return "pdf"
  return "unsupported"
}

export default function ResourcePreviewModal({ resource, isOpen, onClose, onDownload }) {
  if (!isOpen || !resource) return null

  const previewType = getPreviewType(resource)
  const canPreview = previewType !== "unsupported" && Boolean(resource.file_path)

  const footer = (
    <div className="tp-lesson-modal-footer-inner tp-lesson-modal-footer-inner--end">
      <button type="button" className="tp-btn tp-btn-secondary" onClick={onClose}>
        Close
      </button>
      <button type="button" className="tp-btn tp-btn-primary" onClick={() => onDownload(resource)}>
        Download file
      </button>
    </div>
  )

  return (
    <TpLessonModalFrame
      isOpen={isOpen}
      onClose={onClose}
      title={resource.title || "Resource preview"}
      subtitle={resource.category ? `Category: ${resource.category}` : undefined}
      icon={Eye}
      size="lg"
      footer={footer}
    >
      <div className="tp-resource-preview-wrap">
        {canPreview && previewType === "image" ? (
          <img
            src={resource.file_path}
            alt={resource.title || "Resource preview"}
            className="tp-resource-preview-image"
          />
        ) : null}

        {canPreview && previewType === "pdf" ? (
          <iframe
            title={resource.title || "Resource preview"}
            src={resource.file_path}
            className="tp-resource-preview-frame"
          />
        ) : null}

        {!canPreview ? (
          <div className="tp-resource-preview-empty">
            <p className="tp-resource-preview-empty-title">Preview is not available for this file type.</p>
            <p className="tp-resource-preview-empty-subtitle">
              Use the download button to open the resource on your device.
            </p>
          </div>
        ) : null}
      </div>
    </TpLessonModalFrame>
  )
}
