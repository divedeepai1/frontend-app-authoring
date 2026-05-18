import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Award, BookOpen, ChevronLeft, ChevronRight, Layers } from "lucide-react"
import TpCheckbox from "../common/TpCheckbox"
import TpLessonModalFrame from "../../modules/lesson-modals/components/TpLessonModalFrame"
import { fetchRubricForTeacher, unwrapRubric } from "../../modules/lesson-modals/services/previewApi"
import "../../theme/teachers-portal-scope.css"

const TP_ACCENT = "#27aae1"
const TP_NAVY = "#27576b"
const TP_TEXT = "#101828"
const TP_MUTED = "#6a7282"

const shell = {
  overlay: { background: "rgba(15, 23, 42, 0.55)" },
  panel: {
    width: "min(96vw, 920px)",
    maxHeight: "min(92vh, 880px)",
    borderRadius: 16,
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    background: "linear-gradient(180deg, #f8fafc 0%, #fff 100%)",
    flexShrink: 0,
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 22px",
    background: "#f8fafc",
  },
  footer: {
    flexShrink: 0,
    padding: "12px 20px",
    borderTop: "1px solid #e2e8f0",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
}

/** Remove `download` so embedded lesson HTML does not force file saves when images/docs are linked. */
const stripDownloadAttrFromHtml = (html) => {
  if (!html || typeof html !== "string") return ""
  return html.replace(/\sdownload(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi, "")
}

const PreviewStemHtml = ({ html, style, className = "preview-stem" }) => {
  const ref = useRef(null)
  const safe = useMemo(() => stripDownloadAttrFromHtml(html), [html])
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const onClickCapture = (e) => {
      const a = e.target?.closest?.("a")
      if (a?.hasAttribute?.("download")) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    root.addEventListener("click", onClickCapture, true)
    return () => root.removeEventListener("click", onClickCapture, true)
  }, [safe])
  return <div ref={ref} className={className} style={style} dangerouslySetInnerHTML={{ __html: safe }} />
}

const toMediaSrc = (value) => {
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

/**
 * Iframes often show blank for S3 image URLs (X-Frame-Options / wrong document mode).
 * Prefer <img> for images and for typical S3 object URLs that are not clearly PDFs.
 */
const classifyDocumentEmbed = (src) => {
  if (!src || typeof src !== "string") return "iframe"
  if (src.startsWith("data:image/")) return "image"
  if (src.startsWith("data:application/pdf")) return "pdf"
  if (/\.pdf(\?|#|$)/i.test(src) || urlDeclaresPdfType(src)) return "pdf"
  if (IMAGE_IN_URL_RE.test(src) || urlDeclaresImageType(src)) return "image"
  if (isLikelyS3HttpUrl(src) || isLikelyCloudFrontUrl(src)) return "image"
  return "iframe"
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

/** img src values embedded in lesson HTML (deduped with structured image fields). */
const extractImgSrcsFromHtml = (html) => {
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

const mergeImageUrls = (itemOrQ, html) => {
  const a = collectImageUrls(itemOrQ || {})
  const b = extractImgSrcsFromHtml(html || "")
  return [...new Set([...a, ...b].filter(Boolean))]
}

/** URLs from MCQ / multi-select option rows (`image_url`, `images`, nested objects). */
const collectImageUrlsFromOption = (opt) => {
  if (opt == null || typeof opt !== "object") return []
  const urls = [...collectImageUrls(opt)]
  const raw = opt.image_url
  if (raw != null && typeof raw !== "string" && !Array.isArray(raw)) {
    const s = toMediaSrc(raw)
    if (s && typeof s === "string" && s.trim()) urls.push(s.trim())
  }
  const nested = opt.image && typeof opt.image === "object" ? opt.image.url || opt.image.presigned_url || opt.image.href : null
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

/** Question stem + options + ordering / matching rows (deduped, stable order). */
const collectAllObjectiveQuestionImages = (q) => {
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

const stripImgTagsFromHtml = (html) => {
  if (!html || typeof html !== "string") return html
  return html.replace(/<img\b[^>]*>/gi, "")
}

const normalizeObjectiveType = (q) => {
  const raw = String(q.objective_type || q.type || "").toLowerCase().replace(/_/g, "-")
  if (raw.includes("true") && raw.includes("false")) return "true-false"
  if (raw === "mcq" || raw === "multiple-choice" || raw === "multiplechoice") return "multiple-choice"
  if (raw.includes("multi") && raw.includes("select")) return "multi-select"
  if (raw.includes("fill")) return "fill-in-the-blank"
  if (raw === "short-answer" || raw === "shortanswer") return "short-answer"
  if (raw.includes("match")) return "matching"
  if (raw.includes("order") || raw === "reordering") return "ordering"
  if (raw.includes("categor")) return "categorizing"
  return raw || "multiple-choice"
}

/** Prefer learner-filled value; fall back to correct/key for teacher preview */
const pickResponse = (q) => {
  const keys = ["student_answer", "user_answer", "filled_answer", "response", "selected_answer", "learner_answer"]
  for (const k of keys) {
    if (q[k] !== undefined && q[k] !== null && q[k] !== "") return q[k]
  }
  return q.correct_answer !== undefined ? q.correct_answer : null
}

const optionText = (opt, i) => {
  if (opt == null) return `Option ${i + 1}`
  if (typeof opt === "string") return opt
  return opt.text != null ? String(opt.text) : String(opt)
}

const blockShell = {
  background: "#fff",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  padding: "14px 16px",
  marginBottom: 12,
  boxShadow: "none",
}

const Card = ({ children, style = {} }) => (
  <div style={{ ...blockShell, ...style }}>
    {children}
  </div>
)

const SectionLabel = ({ children }) => (
  <div className="tp-lesson-preview-section-head">
    <span className="tp-lesson-preview-section-bar" aria-hidden />
    <h3 className="tp-lesson-preview-section-title">{children}</h3>
  </div>
)

const BlockNumber = ({ n, inline }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 28,
      height: 28,
      borderRadius: 8,
      background: "#f1f5f9",
      color: "#334155",
      fontSize: 13,
      fontWeight: 700,
      marginBottom: inline ? 0 : 12,
    }}
  >
    {n}
  </div>
)

/** Compact gallery: left-aligned, not full card width. */
const GALLERY_MAX_W = 260
const ImageGalleryPreview = ({ urls, resetKey }) => {
  const list = useMemo(() => [...new Set((urls || []).filter(Boolean))], [urls])
  const [active, setActive] = useState(0)

  useEffect(() => {
    setActive(0)
  }, [resetKey, list.join("|")])

  if (list.length === 0) return null

  const outer = { marginTop: 12, width: "100%", maxWidth: GALLERY_MAX_W }

  if (list.length === 1) {
    const src = list[0]
    return (
      <div style={outer}>
        <div
          style={{
            borderRadius: 10,
            border: `2px solid ${TP_ACCENT}`,
            background: "#f8fafc",
            padding: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 88,
          }}
        >
          <img
            src={src}
            alt=""
            referrerPolicy="no-referrer"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            style={{ maxWidth: "100%", maxHeight: 160, objectFit: "contain", display: "block", borderRadius: 6 }}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={outer}>
      <div
        style={{
          borderRadius: 10,
          border: `2px solid ${TP_ACCENT}`,
          background: "#f8fafc",
          padding: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 112,
          marginBottom: 8,
        }}
      >
        <img
          key={list[active]}
          src={list[active]}
          alt=""
          referrerPolicy="no-referrer"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          style={{ maxWidth: "100%", maxHeight: 170, objectFit: "contain", display: "block", borderRadius: 6 }}
        />
      </div>
      <div
        className="lesson-preview-thumb-strip"
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 6,
          overflowX: "auto",
          overflowY: "hidden",
          paddingBottom: 4,
          maxWidth: "100%",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {list.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1}`}
            aria-current={i === active ? "true" : undefined}
            style={{
              flex: "0 0 auto",
              padding: 2,
              borderRadius: 8,
              border: i === active ? `2px solid ${TP_ACCENT}` : "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              boxSizing: "border-box",
              lineHeight: 0,
            }}
          >
            <img
              src={src}
              alt=""
              referrerPolicy="no-referrer"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              style={{
                width: 56,
                height: 56,
                objectFit: "cover",
                borderRadius: 6,
                display: "block",
                opacity: i === active ? 1 : 0.85,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

const docPaneMediaBox = {
  width: "100%",
  minHeight: 200,
  maxHeight: 480,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8fafc",
  overflow: "auto",
}

const DocumentPane = ({ title, value }) => {
  const src = useMemo(() => toMediaSrc(value), [value])
  const kind = useMemo(() => classifyDocumentEmbed(src), [src])
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    setPhase(0)
  }, [src])

  if (!src) {
    return (
      <div
        style={{
          borderRadius: 10,
          border: "1px dashed #e5e7eb",
          minHeight: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 12,
          background: "#fff",
        }}
      >
        No {title.toLowerCase()}
      </div>
    )
  }

  const showImageFirst = kind === "image" && phase === 0
  const showIframe = kind === "pdf" || kind === "iframe"
  const showOpenLink = kind === "image" && phase >= 1

  const openFallback = (
    <div style={{ ...docPaneMediaBox, flexDirection: "column", gap: 10, padding: 16 }}>
      <span style={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>This file cannot be shown inline in the preview.</span>
      <a href={src} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: TP_ACCENT }}>
        Open in new tab
      </a>
    </div>
  )

  return (
    <div style={{ borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", background: "#fff" }}>
      <div style={{ padding: "8px 12px", fontWeight: 600, fontSize: 12, color: "#475569", background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
        {title}
      </div>
      {showImageFirst && (
        <div style={docPaneMediaBox}>
          <img
            src={src}
            alt=""
            referrerPolicy="no-referrer"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onError={() => setPhase((p) => p + 1)}
            style={{ maxWidth: "100%", width: "auto", height: "auto", maxHeight: 480, objectFit: "contain", display: "block" }}
          />
        </div>
      )}
      {showIframe && !showOpenLink && (
        <iframe
          title={title}
          src={src}
          referrerPolicy="no-referrer"
          style={{ width: "100%", height: 400, border: "none", display: "block" }}
        />
      )}
      {showOpenLink && openFallback}
    </div>
  )
}

const getPartAnswerKeyValue = (lesson, rubric, isSyntheticRoot) => {
  if (!lesson || typeof lesson !== "object") return ""
  const fromLesson = lesson.answer_key_url || lesson.answer_key || lesson.answerKey || ""
  if (fromLesson) return fromLesson
  if (isSyntheticRoot && rubric) {
    return rubric.answer_key_url || rubric.answer_key || rubric.answerKey || ""
  }
  return ""
}

/** Lesson-level skills array, or rubric-level fallback when parts omit skills. */
const getPartSkills = (lesson, rubric) => {
  if (lesson && Array.isArray(lesson.skills) && lesson.skills.length > 0) return lesson.skills
  if (rubric && Array.isArray(rubric.skills)) return rubric.skills
  return []
}

/**
 * Foundation vs certification: non-empty `cert_type` (e.g. FS) → certification;
 * empty `cert_type` → foundation (matches builder/API skill rows).
 */
const partitionFoundationCertificationSkills = (skills) => {
  const list = Array.isArray(skills) ? skills : []
  const foundation = []
  const certification = []
  for (const s of list) {
    if (!s || typeof s !== "object") continue
    const cert = String(s.cert_type ?? "").trim()
    if (cert) certification.push(s)
    else foundation.push(s)
  }
  return { foundation, certification }
}

const SkillsPreviewGrid = ({ skills }) => {
  const { foundation, certification } = useMemo(() => partitionFoundationCertificationSkills(skills), [skills])

  const renderColumn = (title, arr) => (
    <div className="tp-lesson-preview-card">
      <SectionLabel>{title}</SectionLabel>
      {arr.length === 0 ? (
        <p className="tp-lesson-preview-skill-empty">None listed</p>
      ) : (
        arr.map((s, i) => {
          const name = String(s.customer_facing_name ?? "").trim() || "Skill"
          const isCert = title.toLowerCase().includes("certification")
          const Icon = isCert ? Layers : Award
          return (
            <div
              key={`${name}-${i}`}
              className={`tp-lesson-preview-skill-card tp-lesson-preview-skill-card--${isCert ? "cert" : "foundation"}`}
            >
              <div className="tp-lesson-preview-skill-icon" aria-hidden>
                <Icon size={22} color={isCert ? TP_NAVY : TP_ACCENT} strokeWidth={2} />
              </div>
              <div>
                <p className="tp-lesson-preview-skill-name">{name}</p>
              </div>
            </div>
          )
        })
      )}
    </div>
  )

  return (
    <div className="lesson-preview-skills-grid" style={{ marginBottom: 12 }}>
      {renderColumn("Foundation skills", foundation)}
      {renderColumn("Certification skills", certification)}
    </div>
  )
}

const optionRowStyle = (active) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 8,
  border: active ? `2px solid ${TP_ACCENT}` : "1px solid #e5e7eb",
  background: "#fff",
  cursor: "default",
})

const radioStyle = {
  width: 18,
  height: 18,
  accentColor: TP_ACCENT,
  cursor: "default",
  flexShrink: 0,
}

const ObjectiveQuestionCard = ({ q, qKey, displayNumber }) => {
  const type = normalizeObjectiveType(q)
  const response = pickResponse(q)
  const opts = Array.isArray(q.options) ? q.options : []
  const blanks = Array.isArray(q.blanks) ? q.blanks : []
  const qImages = useMemo(() => collectAllObjectiveQuestionImages(q), [q])
  const name = `preview-${qKey}`

  const stemHtml =
    q.natural_text && extractImgSrcsFromHtml(q.natural_text).length > 0
      ? stripImgTagsFromHtml(q.natural_text)
      : q.natural_text
  const stem = stemHtml ? (
    <PreviewStemHtml html={stemHtml} style={{ fontSize: 16, color: "#1e293b", lineHeight: 1.55 }} />
  ) : null

  let body = null

  if (type === "true-false") {
    const sel = response === true || response === false ? response : response === "true" ? true : response === "false" ? false : q.correct_answer
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {[
          { v: true, label: "True" },
          { v: false, label: "False" },
        ].map(({ v, label }) => (
          <label
            key={label}
            style={{
              ...optionRowStyle(sel === v),
              alignItems: "center",
            }}
          >
            <input type="radio" name={name} checked={sel === v} readOnly style={radioStyle} />
            <span style={{ fontSize: 14, color: "#334155", fontWeight: 500 }}>{label}</span>
          </label>
        ))}
      </div>
    )
  } else if (type === "multiple-choice") {
    let selected = null
    if (typeof response === "number" && Number.isInteger(response)) selected = response
    else if (typeof response === "string" && opts.length) {
      const idx = opts.findIndex((o, i) => optionText(o, i) === response || String(i) === response)
      selected = idx >= 0 ? idx : null
    }
    if (selected == null && typeof q.correct_answer === "number") selected = q.correct_answer

    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        {opts.map((opt, i) => {
          const text = optionText(opt, i)
          const checked = selected === i
          return (
            <label key={i} style={optionRowStyle(checked)}>
              <input type="radio" name={name} checked={checked} readOnly style={{ ...radioStyle, marginTop: 2 }} />
              <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.45 }}>{text}</span>
            </label>
          )
        })}
      </div>
    )
  } else if (type === "multi-select") {
    let selectedSet = new Set()
    const raw = response != null ? response : q.correct_answer
    if (Array.isArray(raw)) {
      raw.forEach((r) => {
        if (typeof r === "number") selectedSet.add(r)
        else {
          const idx = opts.findIndex((o, i) => optionText(o, i) === String(r))
          if (idx >= 0) selectedSet.add(idx)
        }
      })
    } else if (typeof raw === "number" && Number.isInteger(raw)) {
      selectedSet.add(raw)
    }
    body = (
      <div className="cms-tp-scope" style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        {opts.map((opt, i) => {
          const text = optionText(opt, i)
          const checked = selectedSet.has(i)
          return (
            <div key={i} style={{ ...optionRowStyle(checked), alignItems: "center" }}>
              <TpCheckbox id={`${name}-ms-${i}`} checked={checked} readOnly ariaLabel={text} />
              <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.45, flex: 1, minWidth: 0 }}>{text}</span>
            </div>
          )
        })}
      </div>
    )
  } else if (type === "fill-in-the-blank") {
    const filled = Array.isArray(response)
      ? response
      : response && typeof response === "object" && !Array.isArray(response)
        ? blanks.map((_, i) => response[i] ?? response[String(i)] ?? response[`blank_${i}`])
        : typeof response === "string"
          ? [response]
          : []
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
        {(blanks.length ? blanks : [{ answer: "" }]).map((b, i) => {
          const val = filled[i] != null && filled[i] !== "" ? String(filled[i]) : (b.answer != null ? String(b.answer) : "")
          return (
            <div key={i} style={{ paddingLeft: 2 }}>
              <input
                type="text"
                readOnly
                value={val}
                aria-label={blanks.length > 1 ? `Filled response ${i + 1}` : "Filled response"}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 14,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#0f172a",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )
        })}
      </div>
    )
  } else if (type === "short-answer") {
    const val = response != null ? String(response) : q.correct_answer != null ? String(q.correct_answer) : ""
    body = (
      <div style={{ marginTop: 14 }}>
        <input
          type="text"
          readOnly
          value={val}
          placeholder="—"
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 14,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#0f172a",
            boxSizing: "border-box",
          }}
        />
      </div>
    )
  } else if (type === "matching") {
    const pairs = Array.isArray(q.pairs) ? q.pairs : []
    const userPairs = response && typeof response === "object" && !Array.isArray(response) ? response : null
    body = (
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", fontSize: 13 }}>
        {pairs.map((p, i) => {
          const left = p.left ?? p.term ?? ""
          const right = userPairs && userPairs[left] != null ? userPairs[left] : (p.right ?? p.definition ?? "")
          return (
            <div key={i} style={{ display: "contents" }}>
              <div style={{ padding: "8px 10px", background: "#fff", borderRadius: 6, color: "#334155", border: "1px solid #e5e7eb" }}>{left}</div>
              <span style={{ color: "#94a3b8" }}>→</span>
              <div style={{ padding: "8px 10px", background: "#fff", borderRadius: 6, color: "#334155", border: "1px solid #e5e7eb" }}>{right}</div>
            </div>
          )
        })}
      </div>
    )
  } else if (type === "ordering") {
    const items = Array.isArray(q.items) ? q.items : []
    let order = Array.isArray(response) ? response.map((x) => (typeof x === "number" ? x : items.indexOf(x))).filter((i) => i >= 0) : null
    if (!order || order.length === 0) order = items.map((_, i) => i)
    const ordered = order.map((i) => items[i]).filter(Boolean)
    body = (
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {(ordered.length ? ordered : items).map((it, i) => (
          <div
            key={i}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: 14,
              color: "#334155",
            }}
          >
            {typeof it === "string" ? it : it?.text ?? String(it)}
          </div>
        ))}
      </div>
    )
  } else if (type === "categorizing") {
    const categories = Array.isArray(q.categories) ? q.categories : []
    const catItems = Array.isArray(q.items) ? q.items : []
    const placement = response && typeof response === "object" && !Array.isArray(response) ? response : {}
    body = (
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {categories.map((cat, ci) => {
          const catLabel = typeof cat === "string" ? cat : cat?.name || "Category"
          const under = catItems.filter((it) => {
            const id = typeof it === "object" ? it.id ?? it.text : it
            return placement[String(id)] === catLabel || placement[catLabel]?.includes?.(id)
          })
          return (
            <div key={ci} style={{ borderRadius: 8, border: "1px solid #e5e7eb", padding: 12, background: "#fff" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#475569", marginBottom: 8 }}>{catLabel}</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 13 }}>
                {under.length === 0 && <li style={{ color: "#94a3b8" }}>—</li>}
                {under.map((it, ii) => (
                  <li key={ii}>{typeof it === "object" ? it.text ?? String(it.id) : String(it)}</li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    )
  } else if (opts.length) {
    let selected = null
    const r = pickResponse(q)
    if (typeof r === "number" && Number.isInteger(r)) selected = r
    else if (typeof r === "string") {
      const idx = opts.findIndex((o, i) => optionText(o, i) === r || String(i) === r)
      selected = idx >= 0 ? idx : null
    }
    if (selected == null && typeof q.correct_answer === "number") selected = q.correct_answer
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        {opts.map((opt, i) => {
          const text = optionText(opt, i)
          const checked = selected === i
          return (
            <label key={i} style={optionRowStyle(checked)}>
              <input type="radio" name={name} checked={checked} readOnly style={{ ...radioStyle, marginTop: 2 }} />
              <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.45 }}>{text}</span>
            </label>
          )
        })}
      </div>
    )
  } else {
    const r = pickResponse(q) ?? q.correct_answer
    body = (
      <div style={{ marginTop: 12, fontSize: 14, color: "#475569", padding: 12, background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb" }}>
        {r != null && r !== "" ? String(r) : "—"}
      </div>
    )
  }

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {displayNumber != null && displayNumber !== "" && (
          <div style={{ flexShrink: 0, paddingTop: 2, paddingBottom: 2 }}>
            <BlockNumber n={displayNumber} inline />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 , marginTop: 5}}>
          {stem}
          <ImageGalleryPreview urls={qImages} resetKey={qKey} />
          {body}
        </div>
      </div>
    </Card>
  )
}

const ContentBlock = ({ item, index }) => {
  const key = `${item.block_type}-${item.id ?? index}`
  const blockNum = index + 1
  if (item.block_type === "instruction" || item.block_type === "text") {
    const html = item.natural_text || ""
    const mergedImgs = mergeImageUrls(item, html)
    const htmlForStem =
      html && extractImgSrcsFromHtml(html).length > 0 ? stripImgTagsFromHtml(html) : html
    return (
      <Card key={key}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flexShrink: 0, paddingTop: 2 }}>
            <BlockNumber n={blockNum} inline />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {htmlForStem && <PreviewStemHtml html={htmlForStem} style={{ fontSize: 14, color: "#334155", lineHeight: 1.55 }} />}
            <ImageGalleryPreview urls={mergedImgs} resetKey={key} />
          </div>
        </div>
      </Card>
    )
  }
  if (item.block_type === "objective") {
    const oj = item.objective_json || {}
    const questions = Array.isArray(oj.questions) && oj.questions.length
      ? oj.questions
      : (oj.natural_text || oj.objective_type || (Array.isArray(oj.options) && oj.options.length) ? [oj] : [])
    const multi = questions.length > 1
    return (
      <div key={key}>
        {questions.map((q, qi) => (
          <ObjectiveQuestionCard
            key={q.id || `${key}-q-${qi}`}
            q={q}
            qKey={`${key}-${qi}`}
            displayNumber={multi ? `${blockNum}.${qi + 1}` : blockNum}
          />
        ))}
      </div>
    )
  }
  if (item.block_type === "doc-comparison") {
    return (
      <Card key={key}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flexShrink: 0, paddingTop: 2 }}>
            <BlockNumber n={blockNum} inline />
          </div>
          <div style={{ flex: 1, minWidth: 0, fontSize: 14, color: "#475569", paddingTop: 4 }}>
            Mode: {item.comparison_mode || "—"}
          </div>
        </div>
      </Card>
    )
  }
  return null
}

const LessonPreviewModal = ({ isOpen, onClose, title, openedxBasedId }) => {
  const [rubric, setRubric] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [partIndex, setPartIndex] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setRubric(null)
      setError("")
      setLoading(false)
      setPartIndex(0)
      return
    }
    if (!openedxBasedId) {
      setError("Missing lesson block id.")
      return
    }

    const load = async () => {
      setLoading(true)
      setError("")
      setRubric(null)
      setPartIndex(0)
      try {
        const json = await fetchRubricForTeacher(openedxBasedId)
        const raw = unwrapRubric(json)
        setRubric(raw && typeof raw === "object" ? raw : null)
      } catch (e) {
        setError(e?.message || "Unable to load lesson preview.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [isOpen, openedxBasedId])

  const lessons = useMemo(() => {
    if (!rubric) return []
    if (Array.isArray(rubric.lessons) && rubric.lessons.length) return rubric.lessons
    if (Array.isArray(rubric.items) && rubric.items.length) {
      return [{ id: "root", title: "Lesson", items: rubric.items }]
    }
    return []
  }, [rubric])

  const videoSrc = rubric?.video && typeof rubric.video === "string" ? rubric.video.trim() : ""

  const partCount = lessons.length
  const safePart = partCount ? Math.min(partIndex, partCount - 1) : 0
  const currentLesson = lessons[safePart] || null
  const showIntro = safePart === 0
  const isSyntheticRootLesson = currentLesson?.id === "root"

  const partSkills = useMemo(
    () => (currentLesson ? getPartSkills(currentLesson, rubric) : []),
    [currentLesson, rubric],
  )

  const goPrev = useCallback(() => {
    setPartIndex((i) => Math.max(0, i - 1))
  }, [])
  const goNext = useCallback(() => {
    setPartIndex((i) => Math.min(partCount - 1, i + 1))
  }, [partCount])

  useEffect(() => {
    if (partIndex > 0 && partCount && partIndex > partCount - 1) {
      setPartIndex(partCount - 1)
    }
  }, [partCount, partIndex])

  const previewSubtitle =
    partCount > 1
      ? `Part ${safePart + 1} of ${partCount}${currentLesson?.title ? ` — ${currentLesson.title}` : ""}`
      : title || "Lesson"

  const previewFooter =
    partCount > 1 && !loading && rubric ? (
      <div className="tp-lesson-modal-footer-inner tp-lesson-modal-footer-inner--spread">
        <button type="button" className="tp-btn tp-btn-secondary" onClick={goPrev} disabled={safePart <= 0}>
          <ChevronLeft size={18} aria-hidden /> Back
        </button>
        <span className="tp-lesson-modal-footer-meta">{currentLesson?.title || `Part ${safePart + 1}`}</span>
        <button type="button" className="tp-btn tp-btn-primary" onClick={goNext} disabled={safePart >= partCount - 1}>
          Next <ChevronRight size={18} aria-hidden />
        </button>
      </div>
    ) : null

  return (
    <TpLessonModalFrame
      isOpen={isOpen}
      onClose={onClose}
      title="Unit preview"
      subtitle={previewSubtitle}
      icon={BookOpen}
      size="preview"
      footer={previewFooter}
    >
      <style>{`
        .tp-lesson-modal-body .preview-stem img { max-width: 100%; height: auto; border-radius: 8px; -webkit-user-drag: none; user-drag: none; }
        .tp-lesson-modal-body img { -webkit-user-drag: none; user-drag: none; }
        .tp-lesson-modal-body .preview-stem p:last-child { margin-bottom: 0; }
        .lesson-preview-thumb-strip { scrollbar-width: thin; }
        .lesson-preview-thumb-strip::-webkit-scrollbar { height: 6px; }
        .lesson-preview-thumb-strip::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .lesson-preview-skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 700px) {
          .lesson-preview-skills-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="tp-lesson-preview-body">
          {error && <div className="tp-lesson-modal-alert tp-lesson-modal-alert--error">{error}</div>}
          {loading && (
            <div className="tp-lesson-preview-loading">
              <div className="tp-lesson-preview-spinner" />
              <div style={{ marginTop: 12 }}>Loading preview…</div>
            </div>
          )}

          {!loading && rubric && (
            <>
              {currentLesson && (
                <div>
                  {videoSrc && (
                    <Card style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
                        <SectionLabel>Lesson video</SectionLabel>
                      </div>
                      <video controls src={videoSrc} style={{ width: "100%", maxHeight: 420, display: "block", background: "#101828" }} />
                    </Card>
                  )}

                  <SkillsPreviewGrid skills={partSkills} />

                  {showIntro && (rubric.text_before_video || rubric.lesson_overview || rubric.text_after_video) && (
                    <Card>
                      <SectionLabel>Overview</SectionLabel>
                      {rubric.text_before_video && (
                        <PreviewStemHtml html={rubric.text_before_video} style={{ fontSize: 14, color: "#334155", marginBottom: 12 }} />
                      )}
                      {rubric.lesson_overview && (
                        <PreviewStemHtml html={rubric.lesson_overview} style={{ fontSize: 14, color: "#334155", marginBottom: 12 }} />
                      )}
                      {rubric.text_after_video && (
                        <PreviewStemHtml html={rubric.text_after_video} style={{ fontSize: 14, color: "#334155" }} />
                      )}
                    </Card>
                  )}

                  {partCount <= 1 && (currentLesson.title || currentLesson.weightage != null) && (
                    <div style={{ marginBottom: 14 }}>
                      {currentLesson.title && (
                        <div className="tp-lesson-preview-part-title">{currentLesson.title}</div>
                      )}
                      {currentLesson.weightage != null && (
                        <div className="tp-lesson-preview-part-meta">Weight {currentLesson.weightage}%</div>
                      )}
                    </div>
                  )}
                  {partCount > 1 && (
                    <div style={{ marginBottom: 14 }}>
                      <div className="tp-lesson-preview-part-title">{currentLesson.title || `Part ${safePart + 1}`}</div>
                      {currentLesson.weightage != null && (
                        <div className="tp-lesson-preview-part-meta">Weight {currentLesson.weightage}%</div>
                      )}
                    </div>
                  )}
                  <div className="tp-lesson-preview-instructions-title">Instructions in this lesson</div>
                  {(currentLesson.items || []).map((item, ii) => (
                    <ContentBlock key={`${currentLesson.id}-${item.id ?? ii}`} item={item} index={ii} />
                  ))}
                  <div style={{ marginTop: 20 }}>
                    <DocumentPane title="Answer key" value={getPartAnswerKeyValue(currentLesson, rubric, isSyntheticRootLesson)} />
                  </div>
                </div>
              )}

            </>
          )}

          {!loading && !rubric && !error && (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>No preview data returned.</div>
          )}
      </div>
    </TpLessonModalFrame>
  )
}

export default LessonPreviewModal
