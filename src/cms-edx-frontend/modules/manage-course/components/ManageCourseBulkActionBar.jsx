import { Calendar, Clock, ListChecks, X } from "lucide-react"

export default function ManageCourseBulkActionBar({
  selectedCount,
  onSchedule,
  onTimer,
  onAttempts,
  onClear,
}) {
  if (!selectedCount) return null

  const label = `${selectedCount} lesson${selectedCount === 1 ? "" : "s"} selected`

  return (
    <div className="tp-curriculum-bulk-bar" role="region" aria-label="Bulk lesson actions">
      <div className="tp-curriculum-bulk-bar-info">
        <span className="tp-curriculum-bulk-bar-count">{label}</span>
        <button
          type="button"
          className="tp-curriculum-bulk-bar-clear"
          onClick={onClear}
          aria-label="Clear selection"
        >
          <X size={14} strokeWidth={2} aria-hidden />
          Clear
        </button>
      </div>
      <div className="tp-curriculum-bulk-bar-actions">
        <button type="button" className="tp-btn tp-btn-outline tp-curriculum-bulk-btn" onClick={onTimer}>
          <Clock size={16} strokeWidth={2} aria-hidden />
          Setup timer
        </button>
        <button type="button" className="tp-btn tp-btn-outline tp-curriculum-bulk-btn" onClick={onAttempts}>
          <ListChecks size={16} strokeWidth={2} aria-hidden />
          Setup attempts
        </button>
        <button type="button" className="tp-btn tp-btn-outline tp-curriculum-bulk-btn" onClick={onSchedule}>
          <Calendar size={16} strokeWidth={2} aria-hidden />
          Schedule access
        </button>
      </div>
    </div>
  )
}
