import ChapterRow from "./structure/ChapterRow"
import LessonRow from "./structure/LessonRow"
import ManageCourseTableHeader from "./structure/ManageCourseTableHeader"
import UnitRow from "./structure/UnitRow"

export default function ManageCourseStructureTable({
  chapters,
  lessonsByChapter,
  verticalsByLesson,
  expandedChapters,
  expandedLessons,
  selection,
  onToggleChapter,
  onToggleLessonUi,
  onToggleLessonExpanded,
  onPreview,
  onTimer,
  onAttempts,
  onSchedule,
}) {
  const hasUnits = selection.units.length > 0

  return (
    <div className="tp-curriculum-table-wrap">
      <table className="tp-curriculum-table">
        <ManageCourseTableHeader
          checked={selection.globalChecked}
          indeterminate={selection.globalIndeterminate}
          disabled={!hasUnits}
          onToggleAll={selection.toggleAll}
        />
        <tbody>
          {chapters.map((chapter, idx) => (
            <ChapterBlock
              key={chapter.id || idx}
              chapter={chapter}
              lessons={lessonsByChapter[String(chapter.id)] || []}
              verticalsByLesson={verticalsByLesson}
              expandedChapters={expandedChapters}
              expandedLessons={expandedLessons}
              selection={selection}
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
  selection,
  onToggleChapter,
  onToggleLessonUi,
  onToggleLessonExpanded,
  onPreview,
  onTimer,
  onAttempts,
  onSchedule,
}) {
  const chapterId = String(chapter.id)
  const chapterOpen = expandedChapters[chapter.id]
  const chapterUnits = selection.unitsByChapter[chapterId] || []
  const chapterState = selection.getChapterState(chapter.id)

  return (
    <>
      <ChapterRow
        chapter={chapter}
        chapterOpen={chapterOpen}
        checked={chapterState.checked}
        indeterminate={chapterState.indeterminate}
        hasUnits={chapterUnits.length > 0}
        onToggleChapter={onToggleChapter}
        onToggleSelection={selection.toggleChapter}
      />
      {chapterOpen &&
        lessons.map((lesson, lidx) => (
          <LessonBlock
            key={lesson.id || lidx}
            lesson={lesson}
            verticals={verticalsByLesson[String(lesson.id)] || []}
            expandedLessons={expandedLessons}
            selection={selection}
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
  selection,
  onToggleLessonUi,
  onToggleLessonExpanded,
  onPreview,
  onTimer,
  onAttempts,
  onSchedule,
}) {
  const lessonOpen = expandedLessons[lesson.id]
  const lessonUnits = selection.unitsByLesson[String(lesson.id)] || []
  const lessonState = selection.getLessonState(lesson.id)

  return (
    <>
      <LessonRow
        lesson={lesson}
        lessonOpen={lessonOpen}
        checked={lessonState.checked}
        indeterminate={lessonState.indeterminate}
        hasUnits={lessonUnits.length > 0}
        expandedLessons={expandedLessons}
        onToggleLessonUi={onToggleLessonUi}
        onToggleLessonExpanded={onToggleLessonExpanded}
        onToggleSelection={selection.toggleLesson}
      />
      {lessonOpen &&
        verticals.map((vertical, vidx) => (
          <UnitRow
            key={vertical.id || vidx}
            vertical={vertical}
            checked={selection.isSelected(vertical.id)}
            onToggleSelection={selection.toggleUnit}
            onPreview={() => onPreview(lesson, vertical)}
            onTimer={() => onTimer(lesson, vertical)}
            onAttempts={() => onAttempts(lesson, vertical)}
            onSchedule={() => onSchedule(lesson, vertical)}
          />
        ))}
    </>
  )
}
