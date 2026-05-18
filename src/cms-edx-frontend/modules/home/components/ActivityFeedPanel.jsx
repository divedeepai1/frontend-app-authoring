import { useMemo, useState } from "react"
import { Activity } from "lucide-react"
import { CLASS_FILTER_OPTIONS, MOCK_ACTIVITY_STUDENTS } from "../data/mockHomeData"

function displayName(student) {
  if (student.firstName || student.lastName) {
    return `${student.firstName} ${student.lastName}`.trim()
  }
  return student.username
}

export default function ActivityFeedPanel() {
  const [classFilter, setClassFilter] = useState("All Classes")

  const filteredStudents = useMemo(() => {
    if (classFilter === "All Classes") return MOCK_ACTIVITY_STUDENTS
    return MOCK_ACTIVITY_STUDENTS.filter(
      (s) => s.className.toLowerCase() === classFilter.toLowerCase(),
    )
  }, [classFilter])

  return (
    <section className="tp-home-feed-panel" aria-labelledby="tp-home-activity-title">
      <div className="tp-home-feed-header">
        <div className="tp-home-feed-title-row">
          <Activity className="tp-home-feed-title-icon" size={22} aria-hidden />
          <h2 id="tp-home-activity-title" className="tp-home-feed-title">
            Activity Feed
          </h2>
        </div>
        <label className="tp-home-feed-filter">
          <span className="visually-hidden">Filter by class</span>
          <select
            className="tp-resources-select tp-home-feed-select"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            {CLASS_FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="tp-home-activity-list">
        {filteredStudents.length === 0 ? (
          <p className="tp-home-empty">No activity for this class.</p>
        ) : (
          filteredStudents.map((student) => (
            <article key={student.username} className="tp-home-activity-item">
              <div className="tp-home-activity-avatar" aria-hidden>
                {displayName(student).charAt(0).toUpperCase()}
              </div>
              <div className="tp-home-activity-body">
                <p className="tp-home-activity-name">{displayName(student)}</p>
                <p className="tp-home-activity-meta">
                  <span className="tp-home-activity-class">{student.className}</span>
                  <span className="tp-home-activity-dot" aria-hidden>
                    ·
                  </span>
                  <span>{student.activity}</span>
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
