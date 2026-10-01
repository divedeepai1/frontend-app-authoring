import { Building2, School } from "lucide-react"
import { useDistrictSchool } from "../context/DistrictSchoolContext"

export default function DistrictSchoolHeaderMeta() {
  const { districtName, schoolName, loading } = useDistrictSchool()
  const hasNames = Boolean(districtName || schoolName)

  if (loading && !hasNames) {
    return (
      <div className="tp-portal-org-meta" aria-busy="true" aria-live="polite">
        <span className="tp-portal-org-meta-loading">Loading organization…</span>
      </div>
    )
  }

  if (!hasNames) {
    return null
  }

  return (
    <div className="tp-portal-org-meta" aria-label="District and school">
      {districtName ? (
        <div className="tp-portal-org-item">
          <Building2 className="tp-portal-org-icon" size={22} strokeWidth={1.75} aria-hidden />
          <div className="tp-portal-org-copy">
            <span className="tp-portal-org-label">District</span>
            <span className="tp-portal-org-value">{districtName}</span>
          </div>
        </div>
      ) : null}

      {districtName && schoolName ? (
        <span className="tp-portal-org-divider" aria-hidden />
      ) : null}

      {schoolName ? (
        <div className="tp-portal-org-item">
          <School className="tp-portal-org-icon" size={22} strokeWidth={1.75} aria-hidden />
          <div className="tp-portal-org-copy">
            <span className="tp-portal-org-label">School</span>
            <span className="tp-portal-org-value">{schoolName}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
