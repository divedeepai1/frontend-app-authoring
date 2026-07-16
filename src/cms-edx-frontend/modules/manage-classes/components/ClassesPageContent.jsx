import { Plus } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import TpDeleteConfirmationModal from "../../../components/common/TpDeleteConfirmationModal"
import { useClassesList } from "../hooks/useClassesList"
import {
  CLASS_STATUS_FILTERS,
  filterClassroomsByStatus,
} from "../utils/classFilters"
import ClassStatusFilter from "./ClassStatusFilter"
import ClassesTableSection from "./ClassesTableSection"

const CONFIRM_NONE = { type: null, id: null, name: "" }

const EMPTY_MESSAGES = {
  [CLASS_STATUS_FILTERS.ALL]: "No classes found",
  [CLASS_STATUS_FILTERS.ACTIVE]: "No active classes found",
  [CLASS_STATUS_FILTERS.ARCHIVED]: "No archived classes found",
}

export default function ClassesPageContent() {
  const navigate = useNavigate()
  const {
    classrooms,
    loading,
    refreshing,
    archiveClass,
    unarchiveClass,
    deleteClass,
  } = useClassesList()

  const [statusFilter, setStatusFilter] = useState(CLASS_STATUS_FILTERS.ACTIVE)
  const [selectedClasses, setSelectedClasses] = useState([])
  const [confirmModal, setConfirmModal] = useState(CONFIRM_NONE)

  const filteredClassrooms = useMemo(
    () => filterClassroomsByStatus(classrooms, statusFilter),
    [classrooms, statusFilter]
  )

  const closeConfirmModal = useCallback(() => {
    setConfirmModal(CONFIRM_NONE)
  }, [])

  const handleFilterChange = useCallback((nextFilter) => {
    setStatusFilter(nextFilter)
    setSelectedClasses([])
  }, [])

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedClasses(filteredClassrooms.map((cls) => cls.id))
    else setSelectedClasses([])
  }

  const handleSelectOne = (id) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    )
  }

  const handleView = useCallback(
    (cls) => {
      navigate(`/classes/${cls.id}`)
      sessionStorage.setItem("classData", JSON.stringify(cls))
    },
    [navigate]
  )

  const handleEdit = useCallback(
    (e, cls) => {
      e.stopPropagation()
      sessionStorage.setItem("manageClassMode", "edit")
      sessionStorage.setItem("classId", cls.id)
      sessionStorage.setItem("classData", JSON.stringify(cls))
      navigate("/manage-classes/1")
    },
    [navigate]
  )

  const openCreateClass = useCallback(() => {
    sessionStorage.removeItem("classId")
    sessionStorage.removeItem("classData")
    sessionStorage.setItem("manageClassMode", "create")
    navigate("/manage-classes/1")
  }, [navigate])

  const handleConfirmAction = useCallback(async () => {
    const { type, id } = confirmModal
    if (!id) return

    if (type === "delete") {
      await deleteClass(id)
      setSelectedClasses((prev) => prev.filter((cid) => String(cid) !== String(id)))
    } else if (type === "archive") {
      await archiveClass(id)
      setSelectedClasses((prev) => prev.filter((cid) => String(cid) !== String(id)))
    } else if (type === "unarchive") {
      await unarchiveClass(id)
    }
  }, [confirmModal, deleteClass, archiveClass, unarchiveClass])

  const confirmCopy = (() => {
    const name = confirmModal.name || "this class"

    switch (confirmModal.type) {
      case "archive":
        return {
          title: `Archive "${name}"?`,
          message:
            "The class will be marked inactive and hidden from active class lists. You can unarchive it later.",
          confirmLabel: "Archive",
          confirmButtonClassName: "tp-btn tp-btn-danger",
          iconColor: "#dc2626",
        }
      case "unarchive":
        return {
          title: `Unarchive "${name}"?`,
          message:
            "The class will be restored to your active class list and visible again.",
          confirmLabel: "Unarchive",
          confirmButtonClassName: "tp-btn tp-btn-danger",
          iconColor: "#dc2626",
        }
      case "delete":
      default:
        return {
          title: "Delete class",
          message:
            "Are you sure you want to delete this class? All associated students and data will be removed. This action cannot be undone.",
          confirmLabel: "Delete",
          confirmButtonClassName: "tp-btn tp-btn-danger",
          iconColor: "#dc2626",
        }
    }
  })()

  const tableLoading = loading || refreshing
  const selectionEnabled = statusFilter !== CLASS_STATUS_FILTERS.ARCHIVED

  return (
    <>
      <ClassesTableSection
        isLoading={tableLoading}
        title="My classes"
        description="Manage and organize your class information"
        classrooms={filteredClassrooms}
        emptyMessage={EMPTY_MESSAGES[statusFilter]}
        enableSelection={selectionEnabled}
        selectedIds={selectedClasses}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onView={handleView}
        onEdit={handleEdit}
        onArchive={(cls) =>
          setConfirmModal({ type: "archive", id: cls.id, name: cls.name || "" })
        }
        onUnarchive={(cls) =>
          setConfirmModal({ type: "unarchive", id: cls.id, name: cls.name || "" })
        }
        onDelete={(cls) =>
          setConfirmModal({ type: "delete", id: cls.id, name: cls.name || "" })
        }
        headerAction={
          <button type="button" className="tp-btn tp-btn-primary tp-myclasses-add-btn" onClick={openCreateClass}>
            <Plus size={16} strokeWidth={2} aria-hidden />
            Add a new class
          </button>
        }
        filterBar={<ClassStatusFilter value={statusFilter} onChange={handleFilterChange} />}
      />

      <TpDeleteConfirmationModal
        isOpen={Boolean(confirmModal.type)}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmCopy.title}
        message={confirmCopy.message}
        itemName={confirmModal.type === "delete" ? confirmModal.name || undefined : undefined}
        confirmLabel={confirmCopy.confirmLabel}
        cancelLabel="Cancel"
        confirmButtonClassName={confirmCopy.confirmButtonClassName}
        iconColor={confirmCopy.iconColor}
      />
    </>
  )
}
