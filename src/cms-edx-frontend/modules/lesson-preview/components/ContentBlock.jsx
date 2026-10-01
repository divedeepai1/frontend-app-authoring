import {
  extractImgSrcsFromHtml,
  mergeImageUrls,
  stripImgTagsFromHtml,
} from "../previewMedia"
import ObjectiveQuestionCard from "./ObjectiveQuestionCard"
import { BlockNumber, PreviewCard, PreviewStemHtml } from "./PreviewUi"
import ImageGalleryPreview from "./ImageGalleryPreview"

export default function ContentBlock({ item, index }) {
  const key = `${item.block_type}-${item.id ?? index}`
  const blockNum = index + 1

  if (item.block_type === "instruction" || item.block_type === "text") {
    const html = item.natural_text || ""
    const mergedImgs = mergeImageUrls(item, html)
    const htmlForStem =
      html && extractImgSrcsFromHtml(html).length > 0 ? stripImgTagsFromHtml(html) : html
    return (
      <PreviewCard key={key}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flexShrink: 0, paddingTop: 2 }}>
            <BlockNumber n={blockNum} inline />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {htmlForStem && (
              <PreviewStemHtml
                html={htmlForStem}
                style={{ fontSize: 14, color: "#334155", lineHeight: 1.55 }}
              />
            )}
            <ImageGalleryPreview urls={mergedImgs} resetKey={key} />
          </div>
        </div>
      </PreviewCard>
    )
  }

  if (item.block_type === "objective") {
    const oj = item.objective_json || {}
    const questions =
      Array.isArray(oj.questions) && oj.questions.length
        ? oj.questions
        : oj.natural_text || oj.objective_type || (Array.isArray(oj.options) && oj.options.length)
          ? [oj]
          : []
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
      <PreviewCard key={key}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flexShrink: 0, paddingTop: 2 }}>
            <BlockNumber n={blockNum} inline />
          </div>
          <div style={{ flex: 1, minWidth: 0, fontSize: 14, color: "#475569", paddingTop: 4 }}>
            Mode: {item.comparison_mode || "—"}
          </div>
        </div>
      </PreviewCard>
    )
  }

  return null
}
