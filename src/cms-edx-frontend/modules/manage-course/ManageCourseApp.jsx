import { useNavigate } from "react-router"

import CourseResourcesDialog from "../../components/courses/CourseResourcesDialog"

import LessonScheduleModal from "../../components/courses/LessonScheduleModal"

import LessonTimerModal from "../../components/courses/LessonTimerModal"

import LessonAttemptsModal from "../../components/courses/LessonAttemptsModal"

import LessonPreviewModal from "../../components/courses/LessonPreviewModal"

import ManageCourseBulkActionBar from "./components/ManageCourseBulkActionBar"

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

            <button

              type="button"

              className="tp-btn tp-btn-outline"

              onClick={() => navigate("/curriculum/gradebook")}

            >

              View Gradebook

            </button>

          </div>

        </div>



        <ManageCourseBulkActionBar

          selectedCount={c.selection.selectedCount}

          onSchedule={c.openBulkSchedule}

          onTimer={c.openBulkTimer}

          onAttempts={c.openBulkAttempts}

          onClear={c.selection.clearSelection}

        />



        <ManageCourseStructureTable

          isLoading={c.loadingCurriculum}

          chapters={c.chapters}

          lessonsByChapter={c.lessonsByChapter}

          verticalsByLesson={c.verticalsByLesson}

          expandedChapters={c.expandedChapters}

          expandedLessons={c.expandedLessons}

          selection={c.selection}

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

        rubricIds={c.scheduleContext?.rubricIds}

      />



      <LessonTimerModal

        isOpen={!!c.timerContext}

        onClose={() => c.setTimerContext(null)}

        title={c.modalTitle(c.timerContext)}

        students={c.classStudents}

        rubricIds={c.timerContext?.rubricIds}

      />



      <LessonAttemptsModal

        isOpen={!!c.attemptContext}

        onClose={() => c.setAttemptContext(null)}

        title={c.modalTitle(c.attemptContext)}

        students={c.classStudents}

        rubricIds={c.attemptContext?.rubricIds}

      />



      <LessonPreviewModal

        isOpen={!!c.previewContext}

        onClose={() => c.setPreviewContext(null)}

        title={c.modalTitle(c.previewContext)}

        openedxBasedId={c.previewContext?.rubricIds?.[0] || c.previewContext?.rubricId || ""}

      />

    </div>

  )

}

