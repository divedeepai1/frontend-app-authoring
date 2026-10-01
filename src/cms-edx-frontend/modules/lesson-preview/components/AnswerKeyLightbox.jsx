import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"
import { TP_ACCENT } from "../previewConstants"
import { classifyDocumentEmbed } from "../previewMedia"

export default function AnswerKeyLightbox({ open, onClose, src, title = "Answer key" }) {
  const kind = useMemo(() => classifyDocumentEmbed(src), [src])
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!open) return undefined
    setPhase(0)
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, src, onClose])

  if (!open || !src) return null

  const showImage = kind === "image" && phase === 0
  const showIframe = kind === "pdf" || kind === "iframe"
  const showFallback = kind === "image" && phase >= 1

  return (
    <div
      className="cms-tp-scope"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(15, 23, 42, 0.72)",
      }}
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(96vw, 1280px)",
          maxHeight: "min(92vh, 900px)",
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{title}</span>
          <button
            type="button"
            className="tp-btn tp-btn-secondary tp-btn--compact"
            onClick={onClose}
            aria-label="Close expanded answer key"
          >
            <X size={18} aria-hidden />
            Close
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: 16,
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 240,
          }}
        >
          {showImage && (
            <img
              src={src}
              alt=""
              referrerPolicy="no-referrer"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onError={() => setPhase((p) => p + 1)}
              style={{
                width: "100%",
                maxWidth: "100%",
                height: "auto",
                maxHeight: "calc(92vh - 120px)",
                objectFit: "contain",
                display: "block",
                borderRadius: 8,
                background: "#fff",
              }}
            />
          )}
          {showIframe && !showFallback && (
            <iframe
              title={title}
              src={src}
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: "min(75vh, 720px)",
                border: "none",
                display: "block",
                borderRadius: 8,
                background: "#fff",
              }}
            />
          )}
          {showFallback && (
            <div style={{ textAlign: "center", padding: 24 }}>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>
                This answer key cannot be shown inline.
              </p>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 14, fontWeight: 600, color: TP_ACCENT }}
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
