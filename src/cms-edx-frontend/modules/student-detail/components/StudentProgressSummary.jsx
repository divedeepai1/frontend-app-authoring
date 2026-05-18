import { getProgressColor } from "../hooks/useStudentDetail"
import ProgressRing from "./ProgressRing"

export default function StudentProgressSummary({ studentName, courseName, loadingProgress }) {
  const coursePct = loadingProgress.course
  const avgPct = loadingProgress.average

  return (
    <section className="tp-student-detail-summary">
      <div className="tp-student-detail-summary-text">
        <h2 className="tp-student-detail-summary-title">Course Progress</h2>
        <p className="tp-student-detail-summary-desc">
          {studentName} has completed{" "}
          <span style={{ color: getProgressColor(coursePct), fontWeight: 600 }}>
            {Number.isFinite(coursePct) ? coursePct.toFixed(2) : "0.00"}%
          </span>{" "}
          of {courseName || "the course"} with average grade{" "}
          <span style={{ fontWeight: 600 }}>
            {Number.isFinite(avgPct) ? avgPct.toFixed(2) : "0.00"}%
          </span>
        </p>
      </div>
      <div className="tp-student-detail-summary-rings">
        <ProgressRing
          percentage={coursePct}
          color={getProgressColor(coursePct)}
          label="Course Progress"
          size={110}
          strokeWidth={10}
        />
        <ProgressRing
          percentage={avgPct}
          color={getProgressColor(avgPct)}
          label="Average Grade"
          size={110}
          strokeWidth={10}
        />
      </div>
    </section>
  )
}
