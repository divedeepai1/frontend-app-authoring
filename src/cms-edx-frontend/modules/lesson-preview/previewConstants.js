export const TP_ACCENT = "#27aae1"
export const TP_NAVY = "#27576b"

export const blockShell = {
  background: "#fff",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  padding: "14px 16px",
  marginBottom: 12,
  boxShadow: "none",
}

export const GALLERY_MAX_W = 260

export const docPaneMediaBox = {
  width: "100%",
  minHeight: 200,
  maxHeight: 480,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8fafc",
  overflow: "auto",
}

export const PREVIEW_SCOPE_STYLES = `
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
`
