import TpModalFeedback from "../lesson-modals/components/TpModalFeedback"
import ReportsComingSoon from "./components/ReportsComingSoon"
import ReportsFilters from "./components/ReportsFilters"
import ReportsStatsGrid from "./components/ReportsStatsGrid"
import { useReports } from "./hooks/useReports"
import "../../theme/teachers-portal-scope.css"

export default function ReportsApp() {
  const r = useReports()

  return (
    <div className="tp-reports-page">
      <div className="tp-reports-card">
        <ReportsFilters
          classes={r.classes}
          selectedClassId={r.selectedClassId}
          onClassChange={r.setSelectedClassId}
          reportDate={r.reportDate}
          onReportDateChange={r.setReportDate}
          onGenerateReport={r.handleGenerateReport}
          generating={r.loading}
          allClassesValue={r.allClassesValue}
        />

        <div className="tp-reports-main">
          <TpModalFeedback error={r.error} success="" />

          <ReportsStatsGrid cards={r.statsCards} />

          <ReportsComingSoon />
        </div>
      </div>
    </div>
  )
}
