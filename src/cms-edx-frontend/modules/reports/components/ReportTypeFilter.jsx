const OPTIONS = [
  { value: "grade", label: "Grade Report" },
  { value: "lesson_activity", label: "Lesson Activity" },
  { value: "overdue", label: "Overdue Lessons" },
]

export default function ReportTypeFilter({ value, onChange }) {
  return (
    <div className="tp-reports-type-filter" role="group" aria-label="Select report type">
      <div className="tp-segmented-control">
        {OPTIONS.map((option) => {
          const active = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              className={active ? "is-active" : undefined}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
