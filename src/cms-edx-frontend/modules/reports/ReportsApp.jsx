import TpModalFeedback from "../lesson-modals/components/TpModalFeedback"
import { REPORT_TYPES } from "./constants"
import GradeReportTable from "./components/GradeReportTable"
import LessonActivityReportTable from "./components/LessonActivityReportTable"
import OverdueLessonsReportTable from "./components/OverdueLessonsReportTable"
import ReportsFilters from "./components/ReportsFilters"
import ReportsStatsGrid from "./components/ReportsStatsGrid"
import ReportsToolbar from "./components/ReportsToolbar"
import { useReports } from "./hooks/useReports"
import "../../theme/teachers-portal-scope.css"

export default function ReportsApp() {
  const r = useReports()

  return (
    <div className="tp-reports-page">
      <div className="tp-reports-card">
        <ReportsFilters
          classes={r.classes}
          courses={r.courses}
          selectedClassId={r.selectedClassId}
          selectedCourseId={r.selectedCourseId}
          reportType={r.reportType}
          onClassChange={r.handleClassChange}
          onCourseChange={r.handleCourseChange}
          onReportTypeChange={r.handleReportTypeChange}
        />

        <div className="tp-reports-main">
          <TpModalFeedback error={r.error} success="" />

          <ReportsStatsGrid cards={r.statsCards} />

          <section className="tp-reports-section" aria-label={r.currentReportLabel}>
            <ReportsToolbar
              title={r.currentReportLabel}
              subtitle={`${r.selectedClassName} · ${r.selectedCourseName}`}
              onExport={r.handleExport}
              exporting={r.exporting}
              exportDisabled={
                !r.selectedCourseId || r.loadingReport || r.exporting || !r.hasGenerated
              }
            />

            {r.hasGenerated || r.loadingReport ? (
              <>
                {r.reportType === REPORT_TYPES.LESSON_ACTIVITY ? (
                  <LessonActivityReportTable
                    rows={r.lessonActivityRows}
                    isLoading={r.loadingReport}
                  />
                ) : null}

                {r.reportType === REPORT_TYPES.OVERDUE ? (
                  <OverdueLessonsReportTable rows={r.overdueRows} isLoading={r.loadingReport} />
                ) : null}

                {r.reportType === REPORT_TYPES.GRADE ? (
                  <GradeReportTable report={r.gradeReport} isLoading={r.loadingReport} />
                ) : null}
              </>
            ) : (
              <p className="tp-reports-hint">
                Select a class and course to load report results.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
