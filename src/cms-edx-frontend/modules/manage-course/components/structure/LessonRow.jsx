import { ChevronDown, ChevronRight } from "lucide-react"
import ExpandSubsectionToggle from "../ExpandSubsectionToggle"
import SelectionCheckbox from "../selection/SelectionCheckbox"

export default function LessonRow({
  lesson,
  lessonOpen,
  checked,
  indeterminate,
  hasUnits,
  onToggleLessonUi,
  onToggleLessonExpanded,
  onToggleSelection,
  expandedLessons,
}) {
  return (
    <tr className="tp-curriculum-row tp-curriculum-row--subsection">
      <td className="tp-curriculum-td--select tp-curriculum-td--select-subsection">
        <SelectionCheckbox
          id={`tp-curriculum-lesson-${lesson.id}`}
          checked={checked}
          indeterminate={indeterminate}
          disabled={!hasUnits}
          onChange={() => onToggleSelection(lesson.id)}
          ariaLabel={`Select all lessons in ${lesson.title}`}
        />
      </td>
      <td className="tp-curriculum-td--structure">
        <button
          type="button"
          className="tp-curriculum-tree-btn tp-curriculum-tree-btn--subsection"
          onClick={() => onToggleLessonUi(lesson.id)}
        >
          {lessonOpen ? (
            <ChevronDown size={16} strokeWidth={2} aria-hidden />
          ) : (
            <ChevronRight size={16} strokeWidth={2} aria-hidden />
          )}
          <span>{lesson.title}</span>
        </button>
      </td>
      <td className="tp-curriculum-td--actions">
        <ExpandSubsectionToggle
          checked={!!expandedLessons[lesson.id]}
          onChange={() => onToggleLessonExpanded(lesson.id)}
        />
      </td>
    </tr>
  )
}
