import { useEffect, useMemo, useState } from "react"
import { docPaneMediaBox, TP_ACCENT } from "../previewConstants"
import { classifyDocumentEmbed, toMediaSrc } from "../previewMedia"

export default function DocumentPane({ title, value, compact = false }) {
  const src = useMemo(() => toMediaSrc(value), [value])
  const kind = useMemo(() => classifyDocumentEmbed(src), [src])
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    setPhase(0)
  }, [src])

  const maxHeight = compact ? 280 : 480

  if (!src) {
    return (
      <div
        style={{
          borderRadius: 10,
          border: "1px dashed #e5e7eb",
          minHeight: compact ? 140 : 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 12,
          background: "#fff",
        }}
      >
        No {title ? title.toLowerCase() : "document"}
      </div>
    )
  }

  const showImageFirst = kind === "image" && phase === 0
  const showIframe = kind === "pdf" || kind === "iframe"
  const showOpenLink = kind === "image" && phase >= 1

  const openFallback = (
    <div style={{ ...docPaneMediaBox, maxHeight, flexDirection: "column", gap: 10, padding: 16 }}>
      <span style={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>
        This file cannot be shown inline in the preview.
      </span>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 14, fontWeight: 600, color: TP_ACCENT }}
      >
        Open in new tab
      </a>
    </div>
  )

  return (
    <div style={{ borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", background: "#fff" }}>
      {title ? (
        <div
          style={{
            padding: "8px 12px",
            fontWeight: 600,
            fontSize: 12,
            color: "#475569",
            background: "#f8fafc",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          {title}
        </div>
      ) : null}
      {showImageFirst && (
        <div style={{ ...docPaneMediaBox, maxHeight }}>
          <img
            src={src}
            alt=""
            referrerPolicy="no-referrer"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onError={() => setPhase((p) => p + 1)}
            style={{
              maxWidth: "100%",
              width: "auto",
              height: "auto",
              maxHeight,
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
      )}
      {showIframe && !showOpenLink && (
        <iframe
          title={title || "Document"}
          src={src}
          referrerPolicy="no-referrer"
          style={{ width: "100%", height: compact ? 320 : 400, border: "none", display: "block" }}
        />
      )}
      {showOpenLink && openFallback}
    </div>
  )
}
