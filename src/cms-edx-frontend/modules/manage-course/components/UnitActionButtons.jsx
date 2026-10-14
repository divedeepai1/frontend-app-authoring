import { Calendar, Clock, Eye, FileInput, ListChecks } from "lucide-react"

export default function UnitActionButtons({
  onPreview,
  onTimer,
  onAttempts,
  onStartingFileLoad,
  onSchedule,
}) {
  return (
    <div className="tp-curriculum-unit-actions">
      <button
        type="button"
        className="tp-curriculum-unit-action tp-curriculum-unit-action--preview"
        title="Preview unit"
        aria-label="Preview unit"
        onClick={onPreview}
      >
        <Eye size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        className="tp-curriculum-unit-action tp-curriculum-unit-action--timer"
        title="Setup timer"
        aria-label="Setup timer"
        onClick={onTimer}
      >
        <Clock size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        className="tp-curriculum-unit-action tp-curriculum-unit-action--attempts"
        title="Setup attempts"
        aria-label="Setup attempts"
        onClick={onAttempts}
      >
        <ListChecks size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        className="tp-curriculum-unit-action tp-curriculum-unit-action--asfl"
        title="Automatic starting file load"
        aria-label="Automatic starting file load"
        onClick={onStartingFileLoad}
      >
        <FileInput size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        className="tp-curriculum-unit-action tp-curriculum-unit-action--schedule"
        title="Schedule access"
        aria-label="Schedule access"
        onClick={onSchedule}
      >
        <Calendar size={16} strokeWidth={2} />
      </button>
    </div>
  )
}
