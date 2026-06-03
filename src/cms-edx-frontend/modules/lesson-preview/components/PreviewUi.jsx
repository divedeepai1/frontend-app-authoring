import { useEffect, useMemo, useRef } from "react"
import { blockShell } from "../previewConstants"

export const stripDownloadAttrFromHtml = (html) => {
  if (!html || typeof html !== "string") return ""
  return html.replace(/\sdownload(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi, "")
}

export function PreviewStemHtml({ html, style, className = "preview-stem" }) {
  const ref = useRef(null)
  const safe = useMemo(() => stripDownloadAttrFromHtml(html), [html])

  useEffect(() => {
    const root = ref.current
    if (!root) return undefined
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

export function PreviewCard({ children, style = {} }) {
  return (
    <div style={{ ...blockShell, ...style }}>
      {children}
    </div>
  )
}

export function SectionLabel({ children }) {
  return (
    <div className="tp-lesson-preview-section-head">
      <span className="tp-lesson-preview-section-bar" aria-hidden />
      <h3 className="tp-lesson-preview-section-title">{children}</h3>
    </div>
  )
}

export function BlockNumber({ n, inline }) {
  return (
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
}
