import AddResourcesModal from "./components/AddResourcesModal"
import TpDeleteConfirmationModal from "../../components/common/TpDeleteConfirmationModal"
import { useAdditionalResources } from "./hooks/useAdditionalResources"
import ResourcesFiltersBar from "./components/ResourcesFiltersBar"
import ResourcesDataTable from "./components/ResourcesDataTable"
import "../../theme/teachers-portal-scope.css"

export default function AdditionalResourcesApp() {
  const r = useAdditionalResources()

  const handleDialogClose = () => {
    r.setIsResourcesDialogOpen(false)
    r.loadResources()
  }

  return (
    <div className="tp-resources-page">
      <div className="tp-resources-card">
        <div className="tp-resources-card-head">
          <ResourcesFiltersBar
            classes={r.classes}
            courses={r.courses}
            selectedClassId={r.selectedClassId}
            selectedCourseId={r.selectedCourseId}
            onClassChange={r.setSelectedClassId}
            onCourseChange={r.setSelectedCourseId}
            onAddResource={() => r.setIsResourcesDialogOpen(true)}
          />
        </div>
        <ResourcesDataTable
          isLoading={r.isLoading}
          resources={r.filteredResources}
          onDownload={r.handleDownload}
          onDelete={r.handleDeleteClick}
        />
      </div>

      <TpDeleteConfirmationModal
        isOpen={r.deleteModalOpen}
        onClose={r.handleDeleteCancel}
        onConfirm={r.handleDeleteConfirm}
        title="Delete resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        itemName={r.resourceToDelete?.title}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      <AddResourcesModal
        isOpen={r.isResourcesDialogOpen}
        onClose={handleDialogClose}
        classId={r.selectedClassId}
        courseId={r.selectedCourseId}
        onSuccess={r.loadResources}
      />
    </div>
  )
}
