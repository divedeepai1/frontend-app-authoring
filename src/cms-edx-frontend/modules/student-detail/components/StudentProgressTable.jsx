import { Fragment } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { getProgressColor } from "../hooks/useStudentDetail"
import ProgressRing from "./ProgressRing"

export default function StudentProgressTable({
  lessons,
  expandedSections,
  onToggleSection,
  loadingProgress,
  onViewReport,
}) {
  return (
    <div className="tp-student-detail-table-wrap">
      <table className="tp-student-detail-table">
        <colgroup>
          <col />
          <col style={{ width: "7rem" }} />
          <col style={{ width: "8rem" }} />
          <col style={{ width: "6rem" }} />
          <col style={{ width: "10rem" }} />
          <col style={{ width: "7rem" }} />
          <col style={{ width: "8rem" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Chapter Name</th>
            <th className="tp-student-detail-th--center">Progress</th>
            <th className="tp-student-detail-th--center">Last Attempt</th>
            <th className="tp-student-detail-th--center">Grade(%)</th>
            <th className="tp-student-detail-th--center">Due Date</th>
            <th className="tp-student-detail-th--center">Letter Grade</th>
            <th className="tp-student-detail-th--center">Report</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((section) => (
            <Fragment key={section.sectionKey}>
              <tr className="tp-student-detail-section-row">
                <td>
                  <button
                    type="button"
                    className="tp-student-detail-section-btn"
                    onClick={() => onToggleSection(section.sectionKey)}
                  >
                    {expandedSections[section.sectionKey] ? (
                      <ChevronDown size={18} aria-hidden />
                    ) : (
                      <ChevronRight size={18} aria-hidden />
                    )}
                    {section.section}
                  </button>
                </td>
                <td className="tp-student-detail-td--center">
                  <ProgressRing
                    color={getProgressColor(section.targetProgress)}
                    percentage={section.targetProgress}
                    size={72}
                    strokeWidth={6}
                  />
                </td>
                <td className="tp-student-detail-td--center">--</td>
                <td className="tp-student-detail-td--center">
                  {Number.isFinite(section.targetProgress) ? section.targetProgress.toFixed(2) : "0.00"}%
                </td>
                <td className="tp-student-detail-td--center">--</td>
                <td
                  className="tp-student-detail-td--center"
                  style={{ color: section.targetProgress >= 50 ? "#16a34a" : "#6a7282" }}
                >
                  {section.targetProgress >= 50 ? "Pass" : "--"}
                </td>
                <td className="tp-student-detail-td--center">--</td>
              </tr>
              {expandedSections[section.sectionKey]
                ? section.items.map((item, itemIndex) => (
                    <Fragment key={`${section.sectionKey}-item-${itemIndex}`}>
                      <tr className="tp-student-detail-item-row">
                        <td className="tp-student-detail-td--indent">{item.name}</td>
                        <td className="tp-student-detail-td--center">
                          <ProgressRing
                            color={getProgressColor(item.targetProgress)}
                            percentage={item.targetProgress}
                            size={72}
                            strokeWidth={6}
                          />
                        </td>
                        <td className="tp-student-detail-td--center">{item.lastAttempt}</td>
                        <td className="tp-student-detail-td--center">
                          {Number.isFinite(item.targetProgress) ? item.targetProgress.toFixed(2) : "0.00"}%
                        </td>
                        <td className="tp-student-detail-td--center">{item.dueDate || "--"}</td>
                        <td
                          className="tp-student-detail-td--center"
                          style={{ color: item.letterGrade === "Pass" ? "#16a34a" : "#6a7282" }}
                        >
                          {item.letterGrade}
                        </td>
                        <td className="tp-student-detail-td--center">--</td>
                      </tr>
                      {(item.subrubrics || []).map((subrubric, subIndex) => (
                        <tr
                          key={`${section.sectionKey}-sub-${itemIndex}-${subIndex}`}
                          className="tp-student-detail-sub-row"
                        >
                          <td className="tp-student-detail-td--indent-deep">{subrubric.subrubric_title}</td>
                          <td className="tp-student-detail-td--center">--</td>
                          <td className="tp-student-detail-td--center">--</td>
                          <td className="tp-student-detail-td--center">
                            {Number.isFinite(subrubric.subrubric_score)
                              ? subrubric.subrubric_score.toFixed(2)
                              : "0.00"}
                            %
                          </td>
                          <td className="tp-student-detail-td--center">--</td>
                          <td
                            className="tp-student-detail-td--center"
                            style={{
                              color: subrubric.subrubric_score >= 50 ? "#16a34a" : "#6a7282",
                            }}
                          >
                            {subrubric.subrubric_score >= 50 ? "Pass" : "--"}
                          </td>
                          <td className="tp-student-detail-td--center">
                            {subrubric.images && Object.keys(subrubric.images).length > 0 ? (
                              <button
                                type="button"
                                className="tp-btn tp-btn-primary tp-btn--compact"
                                onClick={() =>
                                  onViewReport(subrubric.images.teacher_image_url, subrubric.subrubric_title)
                                }
                              >
                                View Report
                              </button>
                            ) : (
                              "--"
                            )}
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))
                : null}
            </Fragment>
          ))}
          <tr className="tp-student-detail-average-row">
            <td>Course Average</td>
            <td className="tp-student-detail-td--center">
              <ProgressRing
                color={getProgressColor(loadingProgress.average)}
                percentage={loadingProgress.average}
                size={72}
                strokeWidth={6}
              />
            </td>
            <td />
            <td className="tp-student-detail-td--center">
              {Number.isFinite(loadingProgress.average) ? loadingProgress.average.toFixed(2) : "0.00"}%
            </td>
            <td />
            <td className="tp-student-detail-td--center">
              {loadingProgress.average >= 50 ? "Pass" : "-"}
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  )
}
