import TpModalFeedback from "../lesson-modals/components/TpModalFeedback"
import { useAdditionalResources } from "./hooks/useAdditionalResources"
import ResourcesFiltersBar from "./components/ResourcesFiltersBar"
import ResourcesDataTable from "./components/ResourcesDataTable"
import ResourcePreviewModal from "./components/ResourcePreviewModal"
import "../../theme/teachers-portal-scope.css"

export default function AdditionalResourcesApp() {
  const r = useAdditionalResources()

  return (
    <div className="tp-resources-page">
      <div className="tp-resources-card">
        <div className="tp-resources-card-head">
          <ResourcesFiltersBar
            categories={r.categories}
            selectedCategory={r.selectedCategory}
            onCategoryChange={r.setSelectedCategory}
          />
        </div>
        <div className="tp-resources-card-body">
          <TpModalFeedback error={r.error} success="" />
          <ResourcesDataTable
            isLoading={r.isLoading}
            resources={r.filteredResources}
            onView={r.handleView}
            onDownload={r.handleDownload}
          />
        </div>
      </div>

      <ResourcePreviewModal
        resource={r.previewResource}
        isOpen={Boolean(r.previewResource)}
        onClose={() => r.setPreviewResource(null)}
        onDownload={r.handleDownload}
      />
    </div>
  )
}
