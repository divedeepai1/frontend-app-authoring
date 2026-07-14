import { Download } from "lucide-react"

export default function ReportsToolbar({
  title,
  subtitle,
  onExport,
  exporting,
  exportDisabled,
}) {
  return (
    <div className="tp-reports-toolbar">
      <div className="tp-reports-toolbar-text">
        <h4 className="tp-reports-toolbar-title">{title}</h4>
        {subtitle ? <p className="tp-reports-toolbar-subtitle">{subtitle}</p> : null}
      </div>
      <button
        type="button"
        className="tp-btn tp-btn-secondary"
        onClick={onExport}
        disabled={exportDisabled || exporting}
      >
        <Download size={16} strokeWidth={2} aria-hidden />
        {exporting ? "Exporting…" : "Export CSV"}
      </button>
    </div>
  )
}
