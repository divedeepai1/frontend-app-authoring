import { Archive, ArchiveRestore, Edit, Eye, Trash2 } from "lucide-react"
import { isClassArchived } from "../utils/classStatus"

export default function ClassRowActions({
  classroom,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}) {
  const archived = isClassArchived(classroom)

  return (
    <div className="tp-icon-actions">
      {!archived ? (
        <>
          <button
            type="button"
            className="tp-icon-btn"
            title="View class"
            aria-label="View class"
            onClick={() => onView(classroom)}
          >
            <Eye size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="tp-icon-btn"
            title="Edit class"
            aria-label="Edit class"
            onClick={(e) => onEdit(e, classroom)}
          >
            <Edit size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="tp-icon-btn"
            title="Archive class"
            aria-label="Archive class"
            onClick={() => onArchive(classroom)}
          >
            <Archive size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="tp-icon-btn tp-icon-btn-danger"
            title="Delete class"
            aria-label="Delete class"
            onClick={() => onDelete(classroom)}
          >
            <Trash2 size={20} strokeWidth={1.5} />
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="tp-icon-btn"
            title="View class"
            aria-label="View class"
            onClick={() => onView(classroom)}
          >
            <Eye size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="tp-icon-btn"
            title="Restore class"
            aria-label="Restore class"
            onClick={() => onUnarchive(classroom)}
          >
            <ArchiveRestore size={20} strokeWidth={1.5} />
          </button>
        </>
      )}
    </div>
  )
}
