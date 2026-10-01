

import { FileText, Download } from "lucide-react"
import deleteIcon from "../../assests/delete-icon.svg"

export default function ResourceItem({ resource, label, onDownload, onDelete, isLast }) {
  // For backward compatibility with the old resource-panel.jsx
  const displayText = label || resource?.title;
  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: isLast ? "none" : "1px solid #E5E7EB",
  }

  const linkStyle = {
    color: "#111827",
    fontSize: 16,
    lineHeight: 1.5,
    textDecoration: "none",
    cursor: "pointer",
  }

  const iconSquareStyle = {
    width: 25,
    height: 25,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #D1D5DB",
    borderRadius: 2,
    backgroundColor: "#F9FAFB",
    marginRight: "8px",
  }

  const iconStyle = {
    color: "#6B7280",
  }

  const downloadIconStyle = {
    color: "#6B7280",
  }

  const downloadButtonStyle = {
    width: 25,
    height: 25,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #D1D5DB",
    borderRadius: 2,
    backgroundColor: "#d3d3d3",
    cursor: "pointer",
  }

  return (
    <div style={rowStyle}>
      <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
        <span style={iconSquareStyle} aria-hidden="true">
          <FileText size={16} strokeWidth={2} style={iconStyle} />
        </span>
        <span style={linkStyle} aria-label={displayText}>
          {displayText}
        </span>
      </div>
      {/* Only show action buttons if resource and handlers are provided */}
      {resource && onDownload && onDelete && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <span 
            style={downloadButtonStyle} 
            onClick={() => onDownload(resource)} 
            title="Download"
          >
            <Download size={14} strokeWidth={2} style={downloadIconStyle} />
          </span>
          <img 
            src={deleteIcon} 
            onClick={() => onDelete(resource)} 
            alt="delete" 
            title="Delete"
          />
        </div>
      )}
    </div>
  )
}
