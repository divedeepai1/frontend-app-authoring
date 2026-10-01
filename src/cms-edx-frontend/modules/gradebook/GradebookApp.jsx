import ClassWeightSettingsModal from "./components/ClassWeightSettingsModal"
import TpModalFeedback from "../lesson-modals/components/TpModalFeedback"
import GradebookDataTable from "./components/GradebookDataTable"
import GradebookEditModal from "./components/GradebookEditModal"
import GradebookFilters from "./components/GradebookFilters"
import GradebookToolbar from "./components/GradebookToolbar"
import { useGradebook } from "./hooks/useGradebook"
import "../../theme/teachers-portal-scope.css"

export default function GradebookApp() {
  const g = useGradebook()

  return (
    <div className="tp-gradebook-page">
      <div className="tp-gradebook-card">
        <GradebookFilters
          classes={g.classes}
          courses={g.courses}
          selectedClassId={g.selectedClassId}
          selectedCourseId={g.selectedCourse}
          onClassChange={g.setSelectedClassId}
          onCourseChange={g.setSelectedCourse}
          onOpenWeightSettings={() => g.setIsCourseWeightModalOpen(true)}
          weightDisabled={!g.selectedCourse}
        />

        <div className="tp-gradebook-main">
          <GradebookToolbar
            studentSearch={g.studentSearch}
            onStudentSearchChange={g.setStudentSearch}
            onExport={g.handleExport}
            exporting={g.exporting}
            exportDisabled={g.exporting || g.loading || !g.selectedCourse || !g.studentIds.length}
          />

          <TpModalFeedback error={g.error} success={g.success} />

          <GradebookDataTable
            isLoading={g.loading}
            lessons={g.courseRubrics}
            students={g.filteredStudents}
            gradesByStudent={g.gradebookRows}
            editedLessonIds={g.editedLessonIds}
            onEditCell={(student, lesson, value) => {
              g.setOverrideContext({ student, lesson, value })
            }}
          />

          <footer className="tp-gradebook-footer">
            <p className="tp-gradebook-footer-text">
              Showing {g.filteredStudents.length} student{g.filteredStudents.length !== 1 ? "s" : ""}
              {g.selectedCourseName ? ` • ${g.selectedCourseName}` : ""}
            </p>
            <p className="tp-gradebook-footer-hint">
              Click any grade cell to edit • Scroll horizontally to see all units
            </p>
          </footer>
        </div>
      </div>

      <GradebookEditModal
        isOpen={!!g.overrideContext}
        onClose={() => g.setOverrideContext(null)}
        courseId={g.selectedCourse}
        student={g.overrideContext?.student}
        lesson={g.overrideContext?.lesson}
        initialValue={g.overrideContext?.value}
        onSubmit={g.handleOverrideSubmit}
        saving={g.savingOverride}
      />

      <ClassWeightSettingsModal
        isOpen={g.isCourseWeightModalOpen}
        courseId={g.selectedCourse}
        onClose={() => g.setIsCourseWeightModalOpen(false)}
        onFetch={g.handleClassOverrideWeightFetch}
        onSave={g.handleClassOverrideWeightSave}
        onSaveSuccess={() => g.setSuccess("Class override weightage saved")}
        modalTitle="Configure class weight settings"
        modalDescription={`Set lesson, quiz, and test weights for ${g.selectedClassName} in ${g.selectedCourseName}. Total must equal 100.`}
      />
    </div>
  )
}
