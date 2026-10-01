import { Download } from "lucide-react"
import GradebookSearchField from "./GradebookSearchField"

export default function GradebookToolbar({
  studentSearch,
  onStudentSearchChange,
  onExport,
  exporting,
  exportDisabled,
}) {
  return (
    <div className="tp-gradebook-toolbar">
      <h2 className="tp-gradebook-toolbar-title">Class Gradebook</h2>
      <div className="tp-gradebook-toolbar-actions">
        <GradebookSearchField
          value={studentSearch}
          onChange={onStudentSearchChange}
          disabled={false}
        />
        <button
          type="button"
          className="tp-btn tp-btn-primary tp-gradebook-export-btn"
          onClick={onExport}
          disabled={exportDisabled}
        >
          <Download size={16} strokeWidth={2} aria-hidden />
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>
    </div>
  )
}
