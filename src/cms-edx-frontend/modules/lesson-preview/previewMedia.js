const IMAGE_IN_URL_RE = /\.(jpe?g|png|gif|webp|bmp|svg)(\?|#|$)/i

const urlDeclaresImageType = (url) =>
  /response-content-type=image%2F/i.test(url) ||
  /response-content-type=image\//i.test(url)

const urlDeclaresPdfType = (url) =>
  /response-content-type=application%2Fpdf/i.test(url) ||
  /response-content-type=application\/pdf/i.test(url)

const isLikelyS3HttpUrl = (url) =>
  typeof url === "string" &&
  (url.includes("amazonaws.com") ||
    /\/\/s3[.-][^/]+\.amazonaws\.com/i.test(url) ||
    /\/\/[^/]+\.s3[.-][^/]+\.amazonaws\.com/i.test(url))

const isLikelyCloudFrontUrl = (url) => typeof url === "string" && /\.cloudfront\.net/i.test(url)

export const toMediaSrc = (value) => {
  if (!value) return ""
  if (typeof value === "object" && value !== null) {
    const inner = value.url || value.presigned_url || value.href || value.src
    if (inner && typeof inner === "string") return toMediaSrc(inner)
    return ""
  }
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed
  }
  if (trimmed.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(trimmed.replace(/\s/g, ""))) {
    return `data:application/pdf;base64,${trimmed.replace(/\s/g, "")}`
  }
  return trimmed
}

export const classifyDocumentEmbed = (src) => {
  if (!src || typeof src !== "string") return "iframe"
  if (src.startsWith("data:image/")) return "image"
  if (src.startsWith("data:application/pdf")) return "pdf"
  if (/\.pdf(\?|#|$)/i.test(src) || urlDeclaresPdfType(src)) return "pdf"
  if (IMAGE_IN_URL_RE.test(src) || urlDeclaresImageType(src)) return "image"
  if (isLikelyS3HttpUrl(src) || isLikelyCloudFrontUrl(src)) return "image"
  return "iframe"
}

export const canExpandAnswerKey = (src) => {
  if (!src) return false
  const kind = classifyDocumentEmbed(src)
  return kind === "image" || kind === "pdf"
}

const collectImageUrls = (item) => {
  const urls = []
  const push = (u) => {
    if (u && typeof u === "string" && u.trim()) urls.push(u.trim())
  }
  if (Array.isArray(item?.image_url)) item.image_url.forEach(push)
  if (Array.isArray(item?.images)) item.images.forEach(push)
  if (Array.isArray(item?.image_name)) item.image_name.forEach(push)
  push(item?.image_url)
  return urls
}

export const extractImgSrcsFromHtml = (html) => {
  if (!html || typeof html !== "string") return []
  const found = []
  const re = /<img[^>]+src=["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html))) {
    const u = m[1].trim()
    if (u) found.push(u)
  }
  return found
}

export const mergeImageUrls = (itemOrQ, html) => {
  const a = collectImageUrls(itemOrQ || {})
  const b = extractImgSrcsFromHtml(html || "")
  return [...new Set([...a, ...b].filter(Boolean))]
}

const collectImageUrlsFromOption = (opt) => {
  if (opt == null || typeof opt !== "object") return []
  const urls = [...collectImageUrls(opt)]
  const raw = opt.image_url
  if (raw != null && typeof raw !== "string" && !Array.isArray(raw)) {
    const s = toMediaSrc(raw)
    if (s && typeof s === "string" && s.trim()) urls.push(s.trim())
  }
  const nested =
    opt.image && typeof opt.image === "object"
      ? opt.image.url || opt.image.presigned_url || opt.image.href
      : null
  if (nested && typeof nested === "string" && nested.trim()) urls.push(nested.trim())
  urls.push(...extractImgSrcsFromHtml(opt.natural_text || opt.html || ""))
  return urls.filter(Boolean)
}

const collectImageUrlsFromOptionsList = (options) => {
  if (!Array.isArray(options)) return []
  const out = []
  options.forEach((opt) => {
    collectImageUrlsFromOption(opt).forEach((u) => out.push(u))
  })
  return out
}

const collectImageUrlsFromObjectList = (list) => {
  if (!Array.isArray(list)) return []
  const out = []
  list.forEach((entry) => {
    if (entry && typeof entry === "object") {
      collectImageUrls(entry).forEach((u) => out.push(u))
      extractImgSrcsFromHtml(entry.natural_text || entry.html || "").forEach((u) => out.push(u))
    }
  })
  return out
}

const collectImageUrlsFromPairs = (pairs) => {
  if (!Array.isArray(pairs)) return []
  const out = []
  pairs.forEach((p) => {
    if (!p || typeof p !== "object") return
    collectImageUrls(p).forEach((u) => out.push(u))
  })
  return out
}

export const collectAllObjectiveQuestionImages = (q) => {
  if (!q || typeof q !== "object") return []
  const merged = [
    ...mergeImageUrls(q, q.natural_text),
    ...collectImageUrlsFromOptionsList(q.options),
    ...collectImageUrlsFromObjectList(q.items),
    ...collectImageUrlsFromPairs(q.pairs),
    ...collectImageUrlsFromObjectList(q.categories),
    ...collectImageUrlsFromObjectList(q.blanks),
  ].filter(Boolean)
  const seen = new Set()
  const ordered = []
  merged.forEach((u) => {
    if (seen.has(u)) return
    seen.add(u)
    ordered.push(u)
  })
  return ordered
}

export const stripImgTagsFromHtml = (html) => {
  if (!html || typeof html !== "string") return html
  return html.replace(/<img\b[^>]*>/gi, "")
}
