import { ChevronDown, ChevronRight } from "lucide-react"
import ExpandSubsectionToggle from "./ExpandSubsectionToggle"
import UnitActionButtons from "./UnitActionButtons"

export default function ManageCourseStructureTable({
  chapters,
  lessonsByChapter,
  verticalsByLesson,
  expandedChapters,
  expandedLessons,
  onToggleChapter,
  onToggleLessonUi,
  onToggleLessonExpanded,
  onPreview,
  onTimer,
  onAttempts,
  onSchedule,
}) {
  return (
    <div className="tp-curriculum-table-wrap">
      <table className="tp-curriculum-table">
        <thead>
          <tr>
            <th className="tp-curriculum-th">Course Structure</th>
            <th className="tp-curriculum-th tp-curriculum-th--actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chapters.map((chapter, idx) => (
            <ChapterBlock
              key={chapter.id || idx}
              chapter={chapter}
              lessons={lessonsByChapter[String(chapter.id)] || []}
              verticalsByLesson={verticalsByLesson}
              expandedChapters={expandedChapters}
              expandedLessons={expandedLessons}
              onToggleChapter={onToggleChapter}
              onToggleLessonUi={onToggleLessonUi}
              onToggleLessonExpanded={onToggleLessonExpanded}
              onPreview={onPreview}
              onTimer={onTimer}
              onAttempts={onAttempts}
              onSchedule={onSchedule}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ChapterBlock({
  chapter,
  lessons,
  verticalsByLesson,
  expandedChapters,
  expandedLessons,
  onToggleChapter,
  onToggleLessonUi,
  onToggleLessonExpanded,
  onPreview,
  onTimer,
  onAttempts,
  onSchedule,
}) {
  const chapterOpen = expandedChapters[chapter.id]

  return (
    <>
      <tr className="tp-curriculum-row tp-curriculum-row--section">
        <td colSpan={2}>
          <button
            type="button"
            className="tp-curriculum-tree-btn tp-curriculum-tree-btn--section"
            onClick={() => onToggleChapter(chapter.id)}
          >
            {chapterOpen ? (
              <ChevronDown size={16} strokeWidth={2} />
            ) : (
              <ChevronRight size={16} strokeWidth={2} />
            )}
            <span>{chapter.title}</span>
          </button>
        </td>
      </tr>
      {chapterOpen &&
        lessons.map((lesson, lidx) => (
          <LessonBlock
            key={lesson.id || lidx}
            lesson={lesson}
            verticals={verticalsByLesson[String(lesson.id)] || []}
            expandedLessons={expandedLessons}
            onToggleLessonUi={onToggleLessonUi}
            onToggleLessonExpanded={onToggleLessonExpanded}
            onPreview={onPreview}
            onTimer={onTimer}
            onAttempts={onAttempts}
            onSchedule={onSchedule}
          />
        ))}
    </>
  )
}

function LessonBlock({
  lesson,
  verticals,
  expandedLessons,
  onToggleLessonUi,
  onToggleLessonExpanded,
  onPreview,
  onTimer,
  onAttempts,
  onSchedule,
}) {
  const lessonOpen = expandedLessons[lesson.id]

  return (
    <>
      <tr className="tp-curriculum-row tp-curriculum-row--subsection">
        <td>
          <button
            type="button"
            className="tp-curriculum-tree-btn tp-curriculum-tree-btn--subsection"
            onClick={() => onToggleLessonUi(lesson.id)}
          >
            {lessonOpen ? (
              <ChevronDown size={16} strokeWidth={2} />
            ) : (
              <ChevronRight size={16} strokeWidth={2} />
            )}
            <span>• {lesson.title}</span>
          </button>
        </td>
        <td className="tp-curriculum-td--actions">
          <ExpandSubsectionToggle
            checked={!!expandedLessons[lesson.id]}
            onChange={() => onToggleLessonExpanded(lesson.id)}
          />
        </td>
      </tr>
      {lessonOpen &&
        verticals.map((vertical, vidx) => (
          <tr key={vertical.id || vidx} className="tp-curriculum-row tp-curriculum-row--unit">
            <td className="tp-curriculum-td--unit">
              <span className="tp-curriculum-unit-title">{vertical.title}</span>
            </td>
            <td className="tp-curriculum-td--actions">
              <UnitActionButtons
                onPreview={() => onPreview(lesson, vertical)}
                onTimer={() => onTimer(lesson, vertical)}
                onAttempts={() => onAttempts(lesson, vertical)}
                onSchedule={() => onSchedule(lesson, vertical)}
              />
            </td>
          </tr>
        ))}
    </>
  )
}
