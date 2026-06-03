import { useMemo } from "react"
import TpCheckbox from "../../../components/common/TpCheckbox"
import { TP_ACCENT } from "../previewConstants"
import {
  collectAllObjectiveQuestionImages,
  extractImgSrcsFromHtml,
  stripImgTagsFromHtml,
} from "../previewMedia"
import {
  normalizeObjectiveType,
  optionRowStyle,
  optionText,
  pickResponse,
  radioStyle,
} from "../previewObjective"
import ImageGalleryPreview from "./ImageGalleryPreview"
import { BlockNumber, PreviewCard, PreviewStemHtml } from "./PreviewUi"

export default function ObjectiveQuestionCard({ q, qKey, displayNumber }) {
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
    const sel =
      response === true || response === false
        ? response
        : response === "true"
          ? true
          : response === "false"
            ? false
            : q.correct_answer
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {[
          { v: true, label: "True" },
          { v: false, label: "False" },
        ].map(({ v, label }) => (
          <label
            key={label}
            style={{
              ...optionRowStyle(sel === v, TP_ACCENT),
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
            <label key={i} style={optionRowStyle(checked, TP_ACCENT)}>
              <input type="radio" name={name} checked={checked} readOnly style={{ ...radioStyle, marginTop: 2 }} />
              <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.45 }}>{text}</span>
            </label>
          )
        })}
      </div>
    )
  } else if (type === "multi-select") {
    const selectedSet = new Set()
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
            <div key={i} style={{ ...optionRowStyle(checked, TP_ACCENT), alignItems: "center" }}>
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
          const val =
            filled[i] != null && filled[i] !== ""
              ? String(filled[i])
              : b.answer != null
                ? String(b.answer)
                : ""
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
      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 8,
          alignItems: "center",
          fontSize: 13,
        }}
      >
        {pairs.map((p, i) => {
          const left = p.left ?? p.term ?? ""
          const right =
            userPairs && userPairs[left] != null ? userPairs[left] : (p.right ?? p.definition ?? "")
          return (
            <div key={i} style={{ display: "contents" }}>
              <div
                style={{
                  padding: "8px 10px",
                  background: "#fff",
                  borderRadius: 6,
                  color: "#334155",
                  border: "1px solid #e5e7eb",
                }}
              >
                {left}
              </div>
              <span style={{ color: "#94a3b8" }}>→</span>
              <div
                style={{
                  padding: "8px 10px",
                  background: "#fff",
                  borderRadius: 6,
                  color: "#334155",
                  border: "1px solid #e5e7eb",
                }}
              >
                {right}
              </div>
            </div>
          )
        })}
      </div>
    )
  } else if (type === "ordering") {
    const items = Array.isArray(q.items) ? q.items : []
    let order = Array.isArray(response)
      ? response.map((x) => (typeof x === "number" ? x : items.indexOf(x))).filter((i) => i >= 0)
      : null
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
            {typeof it === "string" ? it : (it?.text ?? String(it))}
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
          const catLabel = typeof cat === "string" ? cat : (cat?.name || "Category")
          const under = catItems.filter((it) => {
            const id = typeof it === "object" ? (it.id ?? it.text) : it
            return placement[String(id)] === catLabel || placement[catLabel]?.includes?.(id)
          })
          return (
            <div
              key={ci}
              style={{ borderRadius: 8, border: "1px solid #e5e7eb", padding: 12, background: "#fff" }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: "#475569", marginBottom: 8 }}>{catLabel}</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 13 }}>
                {under.length === 0 && <li style={{ color: "#94a3b8" }}>—</li>}
                {under.map((it, ii) => (
                  <li key={ii}>{typeof it === "object" ? (it.text ?? String(it.id)) : String(it)}</li>
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
            <label key={i} style={optionRowStyle(checked, TP_ACCENT)}>
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
      <div
        style={{
          marginTop: 12,
          fontSize: 14,
          color: "#475569",
          padding: 12,
          background: "#fff",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
        }}
      >
        {r != null && r !== "" ? String(r) : "—"}
      </div>
    )
  }

  return (
    <PreviewCard>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {displayNumber != null && displayNumber !== "" && (
          <div style={{ flexShrink: 0, paddingTop: 2, paddingBottom: 2 }}>
            <BlockNumber n={displayNumber} inline />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0, marginTop: 5 }}>
          {stem}
          <ImageGalleryPreview urls={qImages} resetKey={qKey} />
          {body}
        </div>
      </div>
    </PreviewCard>
  )
}
