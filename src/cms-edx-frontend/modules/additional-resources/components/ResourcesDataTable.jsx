import { FileText, Image as ImageIcon, Download, Trash2 } from "lucide-react"

function fileIconForTitle(title) {
  const t = (title || "").toLowerCase()
  if (/\.(png|jpe?g|gif|webp|svg|bmp|ico)$/.test(t)) return "image"
  return "file"
}

import TpLoadingState from "../../../components/common/TpLoadingState"

export default function ResourcesDataTable({ isLoading, resources, onDownload, onDelete }) {
  if (isLoading) {
    return <TpLoadingState label="Loading resources…" className="tp-resources-loading" />
  }

  if (!resources.length) {
    return (
      <div className="tp-resources-empty">
        <FileText className="tp-resources-empty-icon" strokeWidth={1.5} aria-hidden />
        <p className="tp-resources-empty-text">No resources found</p>
      </div>
    )
  }

  return (
    <div className="tp-resources-table-wrap">
      <table className="tp-resources-table">
        <colgroup>
          <col />
          <col style={{ width: "8.5rem" }} />
        </colgroup>
        <thead>
          <tr>
            <th className="tp-resources-th-name">File name</th>
            <th className="tp-resources-th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => {
            const kind = fileIconForTitle(resource?.title)
            return (
              <tr key={resource.id || resource.s3_key}>
                <td className="tp-resources-td-name">
                  <div className="tp-resources-file-cell">
                    {kind === "image" ? (
                      <ImageIcon className="tp-resources-row-icon" strokeWidth={2} aria-hidden />
                    ) : (
                      <FileText className="tp-resources-row-icon" strokeWidth={2} aria-hidden />
                    )}
                    <span className="tp-resources-file-name">{resource.title || "—"}</span>
                  </div>
                </td>
                <td className="tp-resources-td-actions">
                  <div className="tp-resources-actions">
                    <button
                      type="button"
                      className="tp-resources-action-btn"
                      title="Download"
                      aria-label="Download"
                      onClick={() => onDownload(resource)}
                    >
                      <Download size={16} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className="tp-resources-action-btn tp-resources-action-danger"
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => onDelete(resource)}
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
