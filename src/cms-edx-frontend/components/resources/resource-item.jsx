

import { FileText } from "lucide-react"

export default function ResourceItem({ label, isLast }) {
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
  }

  const iconStyle = {
    color: "#6B7280",
  }

  return (
    <div style={rowStyle}>
      <a href="#" style={linkStyle} aria-label={label}>
        {label}
      </a>
      <span style={iconSquareStyle} aria-hidden="true">
        <FileText size={16} strokeWidth={2} style={iconStyle} />
      </span>
    </div>
  )
}
