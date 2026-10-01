import { useEffect, useMemo, useState } from "react"
import { GALLERY_MAX_W, TP_ACCENT } from "../previewConstants"

export default function ImageGalleryPreview({ urls, resetKey }) {
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
