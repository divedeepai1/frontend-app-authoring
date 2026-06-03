import { useMemo } from "react"
import { Award, Layers } from "lucide-react"
import { TP_ACCENT, TP_NAVY } from "../previewConstants"
import { PreviewCard, SectionLabel } from "./PreviewUi"

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

export default function SkillsPreviewGrid({ skills }) {
  const { foundation, certification } = useMemo(
    () => partitionFoundationCertificationSkills(skills),
    [skills]
  )

  const renderColumn = (title, arr) => {
    const isCert = title.toLowerCase().includes("certification")
    const Icon = isCert ? Layers : Award

    return (
      <PreviewCard style={{ marginBottom: 0 }}>
        <SectionLabel>{title}</SectionLabel>
        {arr.length === 0 ? (
          <p className="tp-lesson-preview-skill-empty">None listed</p>
        ) : (
          arr.map((s, i) => {
            const name = String(s.customer_facing_name ?? "").trim() || "Skill"
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
      </PreviewCard>
    )
  }

  return (
    <div className="lesson-preview-skills-grid" style={{ marginBottom: 12 }}>
      {renderColumn("Foundation skills", foundation)}
      {renderColumn("Certification skills", certification)}
    </div>
  )
}
