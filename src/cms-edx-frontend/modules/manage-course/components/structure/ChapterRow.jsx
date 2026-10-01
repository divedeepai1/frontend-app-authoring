import { ChevronDown, ChevronRight } from "lucide-react"
import SelectionCheckbox from "../selection/SelectionCheckbox"

export default function ChapterRow({
  chapter,
  chapterOpen,
  checked,
  indeterminate,
  hasUnits,
  onToggleChapter,
  onToggleSelection,
}) {
  return (
    <tr className="tp-curriculum-row tp-curriculum-row--section">
      <td className="tp-curriculum-td--select">
        <SelectionCheckbox
          id={`tp-curriculum-chapter-${chapter.id}`}
          checked={checked}
          indeterminate={indeterminate}
          disabled={!hasUnits}
          onChange={() => onToggleSelection(chapter.id)}
          ariaLabel={`Select all lessons in ${chapter.title}`}
        />
      </td>
      <td className="tp-curriculum-td--structure" colSpan={2}>
        <div className="tp-curriculum-section-inner">
          <button
            type="button"
            className="tp-curriculum-tree-btn tp-curriculum-tree-btn--section"
            onClick={() => onToggleChapter(chapter.id)}
          >
            {chapterOpen ? (
              <ChevronDown size={16} strokeWidth={2} aria-hidden />
            ) : (
              <ChevronRight size={16} strokeWidth={2} aria-hidden />
            )}
            <span>{chapter.title}</span>
          </button>
        </div>
      </td>
    </tr>
  )
}
