import { useNavigate } from "react-router"
import CourseResourcesDialog from "../../components/courses/CourseResourcesDialog"
import LessonScheduleModal from "../../components/courses/LessonScheduleModal"
import LessonTimerModal from "../../components/courses/LessonTimerModal"
import LessonAttemptsModal from "../../components/courses/LessonAttemptsModal"
import LessonPreviewModal from "../../components/courses/LessonPreviewModal"
import ManageCourseFilters from "./components/ManageCourseFilters"
import ManageCourseStructureTable from "./components/ManageCourseStructureTable"
import { useManageCourse } from "./hooks/useManageCourse"
import "../../theme/teachers-portal-scope.css"

export default function ManageCourseApp() {
  const navigate = useNavigate()
  const c = useManageCourse()

  return (
    <div className="tp-curriculum-page">
      <div className="tp-curriculum-card">
        <ManageCourseFilters
          classes={c.classes}
          courses={c.courses}
          selectedClassId={c.selectedClassId}
          selectedCourseId={c.selectedCourseId}
          onClassChange={c.setSelectedClassId}
          onCourseChange={c.setSelectedCourseId}
        />

        <div className="tp-curriculum-course-bar">
          <h2 className="tp-curriculum-course-title">{c.courseTitle || "Course"}</h2>
          <div className="tp-curriculum-course-actions">
            {/* <button
              type="button"
              className="tp-btn tp-btn-secondary"
              onClick={() => c.setIsResourcesDialogOpen(true)}
            >
              Add Resources
            </button> */}
            <button
              type="button"
              className="tp-btn tp-btn-outline"
              onClick={() => navigate("/curriculum/gradebook")}
            >
              View Gradebook
            </button>
          </div>
        </div>

        <ManageCourseStructureTable
          chapters={c.chapters}
          lessonsByChapter={c.lessonsByChapter}
          verticalsByLesson={c.verticalsByLesson}
          expandedChapters={c.expandedChapters}
          expandedLessons={c.expandedLessons}
          onToggleChapter={c.toggleChapter}
          onToggleLessonUi={c.toggleLessonUiExpanded}
          onToggleLessonExpanded={c.toggleLessonExpanded}
          onPreview={c.openPreview}
          onTimer={c.openTimer}
          onAttempts={c.openAttempts}
          onSchedule={c.openSchedule}
        />
      </div>

      <CourseResourcesDialog
        isOpen={c.isResourcesDialogOpen}
        onClose={() => c.setIsResourcesDialogOpen(false)}
        classId={c.selectedClassId}
        courseId={c.selectedCourseId}
      />

      <LessonScheduleModal
        isOpen={!!c.scheduleContext}
        onClose={() => c.setScheduleContext(null)}
        courseId={c.selectedCourseId}
        title={c.modalTitle(c.scheduleContext)}
        students={c.classStudents}
        rubricId={c.scheduleContext?.rubricId || ""}
      />

      <LessonTimerModal
        isOpen={!!c.timerContext}
        onClose={() => c.setTimerContext(null)}
        title={c.modalTitle(c.timerContext)}
        students={c.classStudents}
        rubricId={c.timerContext?.rubricId || ""}
      />

      <LessonAttemptsModal
        isOpen={!!c.attemptContext}
        onClose={() => c.setAttemptContext(null)}
        title={c.modalTitle(c.attemptContext)}
        students={c.classStudents}
        rubricId={c.attemptContext?.rubricId || ""}
      />

      <LessonPreviewModal
        isOpen={!!c.previewContext}
        onClose={() => c.setPreviewContext(null)}
        title={c.modalTitle(c.previewContext)}
        openedxBasedId={c.previewContext?.rubricId || ""}
      />
    </div>
  )
}
