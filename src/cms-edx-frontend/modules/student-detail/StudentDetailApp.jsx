import { useStudentDetail } from "./hooks/useStudentDetail"
import StudentDetailHeader from "./components/StudentDetailHeader"
import StudentProgressSummary from "./components/StudentProgressSummary"
import StudentProgressTable from "./components/StudentProgressTable"
import StudentReportModal from "./components/StudentReportModal"
import "../../theme/teachers-portal-scope.css"

export default function StudentDetailApp({ classData, studentName }) {
  const s = useStudentDetail(classData, studentName)

  if (!s.courses.length) {
    return (
      <div className="tp-student-detail-card">
        <p className="tp-student-detail-empty">No courses assigned to this class.</p>
      </div>
    )
  }

  return (
    <div className="tp-student-detail-card">
      <StudentDetailHeader
        className={s.className}
        studentName={s.studentName}
        courseName={s.selectedCourseName}
        courses={s.courses}
        selectedCourseId={s.selectedCourseId}
        onCourseChange={s.selectCourse}
      />

      {s.selectedCourseName ? (
        <>
          <StudentProgressSummary
            studentName={s.studentName}
            courseName={s.selectedCourseName}
            loadingProgress={s.loadingProgress}
          />

          <StudentProgressTable
            isLoading={s.loading}
            lessons={s.lessons}
            expandedSections={s.expandedSections}
            onToggleSection={s.toggleSection}
            loadingProgress={s.loadingProgress}
            onViewReport={s.openReport}
          />
        </>
      ) : null}

      <StudentReportModal
        isOpen={s.reportPopup.open}
        title={s.reportPopup.title}
        imageUrl={s.reportPopup.imageUrl}
        onClose={s.closeReport}
      />
    </div>
  )
}
