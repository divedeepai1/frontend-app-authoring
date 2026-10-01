import { getClassStatusLabel, isClassArchived } from "../utils/classStatus"

export default function ClassStatusBadge({ classroom }) {
  const archived = isClassArchived(classroom)
  const label = getClassStatusLabel(classroom)

  return (
    <span className={`tp-pill ${archived ? "tp-pill-archived" : "tp-pill-active"}`}>{label}</span>
  )
}
