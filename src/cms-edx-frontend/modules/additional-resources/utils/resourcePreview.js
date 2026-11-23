const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"]
const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov"]
const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "m4a"]
const TEXT_EXTENSIONS = ["txt", "csv", "json", "md", "xml", "html", "htm"]

/** MIME types used when building blob object URLs for inline preview. */
export const PREVIEW_MIME_BY_EXT = {
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

/**
 * File types the Teacher Materials preview modal can actually render inline.
 * Office docs (ppt/pptx/doc/docx/xls/xlsx) are excluded — Office Online embed
 * often never loads, leaving teachers on "Fetching preview…".
 */
export const PREVIEWABLE_TYPES = new Set(["image", "pdf", "video", "audio", "text"])

export function getExtensionFromUrl(url) {
  const source = String(url || "").toLowerCase()
  const match = source.match(/\.([a-z0-9]+)(?:[?#].*)?$/)
  return match?.[1] || ""
}

export function getResourceExtension(resource) {
  return getExtensionFromUrl(resource?.file_path) || getExtensionFromUrl(resource?.title)
}

/**
 * @returns {"image"|"pdf"|"video"|"audio"|"text"|"unsupported"}
 */
export function getResourcePreviewType(resource) {
  const ext = getResourceExtension(resource)
  if (IMAGE_EXTENSIONS.includes(ext)) return "image"
  if (ext === "pdf") return "pdf"
  if (VIDEO_EXTENSIONS.includes(ext)) return "video"
  if (AUDIO_EXTENSIONS.includes(ext)) return "audio"
  if (TEXT_EXTENSIONS.includes(ext)) return "text"
  return "unsupported"
}

export function canPreviewResource(resource) {
  return PREVIEWABLE_TYPES.has(getResourcePreviewType(resource))
}
