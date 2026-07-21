import { useEffect, useRef, useState } from "react"
import TpLessonModalFrame from "../../lesson-modals/components/TpLessonModalFrame"
import { Eye } from "lucide-react"

const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"]
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"]
const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov"]
const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "m4a"]
const TEXT_EXTENSIONS = ["txt", "csv", "json", "md", "xml", "html", "htm"]

const MIME_BY_EXT = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
}

function getExtensionFromUrl(url) {
  const source = String(url || "").toLowerCase()
  const match = source.match(/\.([a-z0-9]+)(?:[\?#].*)?$/)
  return match?.[1] || ""
}

function getExtension(resource) {
  return getExtensionFromUrl(resource?.file_path) || getExtensionFromUrl(resource?.title)
}

function getPreviewType(resource) {
  const ext = getExtension(resource)
  if (IMAGE_EXTENSIONS.includes(ext)) return "image"
  if (ext === "pdf") return "pdf"
  if (VIDEO_EXTENSIONS.includes(ext)) return "video"
  if (AUDIO_EXTENSIONS.includes(ext)) return "audio"
  if (TEXT_EXTENSIONS.includes(ext)) return "text"
  if (OFFICE_EXTENSIONS.includes(ext)) return "office"
  return "unsupported"
}

function PreviewLoadingMessage() {
  return (
    <div className="tp-resource-preview-empty">
      <p className="tp-resource-preview-empty-title">Fetching preview…</p>
      <p className="tp-resource-preview-empty-subtitle">Please wait while the file loads, or you can download it.</p>
    </div>
  )
}

function PreviewUnsupportedMessage() {
  return (
    <div className="tp-resource-preview-empty">
      <p className="tp-resource-preview-empty-title">
        Preview is not supported by this browser for this file type.
      </p>
      <p className="tp-resource-preview-empty-subtitle">
        Please use the Download file button to save it instead.
      </p>
    </div>
  )
}

export default function ResourcePreviewModal({ resource, isOpen, onClose, onDownload }) {
  const [previewStatus, setPreviewStatus] = useState("idle")
  const [objectUrl, setObjectUrl] = useState("")
  const [textPreview, setTextPreview] = useState("")
  const [officeEmbedUrl, setOfficeEmbedUrl] = useState("")
  const [embedReady, setEmbedReady] = useState(false)
  const objectUrlRef = useRef("")
  const prefersDirectPreview = typeof window !== "undefined" && window.location.protocol !== "https:"

  const revokeObjectUrl = () => {
    if (objectUrlRef.current && objectUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(objectUrlRef.current)
    }
    objectUrlRef.current = ""
    setObjectUrl("")
  }

  useEffect(() => {
    if (!isOpen || !resource?.file_path) {
      setPreviewStatus("idle")
      revokeObjectUrl()
      setTextPreview("")
      setOfficeEmbedUrl("")
      setEmbedReady(false)
      return undefined
    }

    const previewType = getPreviewType(resource)
    if (previewType === "unsupported") {
      setPreviewStatus("error")
      revokeObjectUrl()
      setTextPreview("")
      setOfficeEmbedUrl("")
      setEmbedReady(false)
      return undefined
    }

    let cancelled = false

    const reset = () => {
      setPreviewStatus("loading")
      revokeObjectUrl()
      setTextPreview("")
      setOfficeEmbedUrl("")
      setEmbedReady(false)
    }
    reset()

    const finishError = () => {
      if (cancelled) return
      setPreviewStatus("error")
      revokeObjectUrl()
      setTextPreview("")
      setOfficeEmbedUrl("")
    }

    const finishReady = (next) => {
      if (cancelled) return
      if (next.objectUrl) {
        revokeObjectUrl()
        objectUrlRef.current = next.objectUrl
        setObjectUrl(next.objectUrl)
      }
      if (next.textPreview != null) setTextPreview(next.textPreview)
      if (next.officeEmbedUrl) setOfficeEmbedUrl(next.officeEmbedUrl)
      setPreviewStatus("ready")
    }

    ;(async () => {
      try {
        if (previewType === "office") {
          const embed = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resource.file_path)}`
          finishReady({ officeEmbedUrl: embed })
          return
        }

        if (previewType === "text") {
          const res = await fetch(resource.file_path, { credentials: "include" })
          if (!res.ok) throw new Error("preview-fetch-failed")
          const content = await res.text()
          finishReady({ textPreview: content.slice(0, 120000) })
          return
        }

        if (prefersDirectPreview) {
          finishReady({ objectUrl: resource.file_path })
          return
        }

        const res = await fetch(resource.file_path, { credentials: "include" })
        if (!res.ok) throw new Error("preview-fetch-failed")
        const blob = await res.blob()
        const ext = getExtension(resource)
        const mime = MIME_BY_EXT[ext] || blob.type || "application/octet-stream"
        const typedBlob = blob.type === mime ? blob : new Blob([blob], { type: mime })
        const url = URL.createObjectURL(typedBlob)
        finishReady({ objectUrl: url })
      } catch {
        finishError()
      }
    })()

    return () => {
      cancelled = true
      revokeObjectUrl()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revokeObjectUrl is stable in behavior per mount
  }, [isOpen, resource, prefersDirectPreview])

  useEffect(() => () => revokeObjectUrl(), [])

  if (!isOpen || !resource) return null

  const previewType = getPreviewType(resource)
  const isUnsupportedType = previewType === "unsupported"
  const isLoading = previewStatus === "loading" || (previewType === "office" && previewStatus === "ready" && !embedReady)
  const isError = previewStatus === "error" || isUnsupportedType
  const isReady = previewStatus === "ready" && !isLoading

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
        {isLoading ? <PreviewLoadingMessage /> : null}

        {isReady && previewType === "image" && objectUrl ? (
          <img
            src={objectUrl}
            alt={resource.title || "Resource preview"}
            className="tp-resource-preview-image"
          />
        ) : null}

        {isReady && previewType === "pdf" && objectUrl ? (
          <iframe
            title={resource.title || "Resource preview"}
            src={objectUrl}
            className="tp-resource-preview-frame"
          />
        ) : null}

        {isReady && previewType === "office" && officeEmbedUrl ? (
          <iframe
            title={resource.title || "Resource preview"}
            src={officeEmbedUrl}
            className="tp-resource-preview-frame"
            onLoad={() => setEmbedReady(true)}
          />
        ) : null}

        {isReady && previewType === "text" ? (
          <pre className="tp-resource-preview-text">{textPreview}</pre>
        ) : null}

        {isReady && previewType === "video" && objectUrl ? (
          <video className="tp-resource-preview-media" controls preload="metadata">
            <source src={objectUrl} />
            Your browser does not support video preview for this file.
          </video>
        ) : null}

        {isReady && previewType === "audio" && objectUrl ? (
          <audio className="tp-resource-preview-audio" controls preload="metadata">
            <source src={objectUrl} />
            Your browser does not support audio preview for this file.
          </audio>
        ) : null}

        {isError && !isLoading ? <PreviewUnsupportedMessage /> : null}
      </div>
    </TpLessonModalFrame>
  )
}
