import { CLASS_STATUS_FILTERS } from "../utils/classFilters"

const OPTIONS = [
  { value: CLASS_STATUS_FILTERS.ALL, label: "All Classes" },
  { value: CLASS_STATUS_FILTERS.ACTIVE, label: "Active" },
  { value: CLASS_STATUS_FILTERS.ARCHIVED, label: "Archived" },
]

export default function ClassStatusFilter({ value, onChange }) {
  return (
    <div className="tp-myclasses-filter" role="group" aria-label="Filter classes by status">
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
