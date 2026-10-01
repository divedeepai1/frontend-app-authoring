import { useMemo, useState } from "react"
import { Maximize2 } from "lucide-react"
import { canExpandAnswerKey, toMediaSrc } from "../previewMedia"
import AnswerKeyLightbox from "./AnswerKeyLightbox"
import DocumentPane from "./DocumentPane"
import { SectionLabel } from "./PreviewUi"

export default function AnswerKeySection({ value }) {
  const [expanded, setExpanded] = useState(false)
  const src = useMemo(() => toMediaSrc(value), [value])
  const expandable = canExpandAnswerKey(src)

  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <SectionLabel>Answer key</SectionLabel>
        {expandable ? (
          <button
            type="button"
            className="tp-btn tp-btn-secondary tp-btn--compact"
            onClick={() => setExpanded(true)}
          >
            <Maximize2 size={16} aria-hidden />
            Expand
          </button>
        ) : null}
      </div>
      <DocumentPane value={value} compact />
      <AnswerKeyLightbox open={expanded} onClose={() => setExpanded(false)} src={src} />
    </div>
  )
}
