
import ResourceItem from "./resource-item"

export default function ResourceSection({ title, items, resources, onDownload, onDelete, className }) {
  const sectionStyle = {
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
  }

  const headerStyle = {
    fontSize: 16,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#374151",
    marginBottom: 8,
  }

  // If resources prop is provided, render resource items
  if (resources && Array.isArray(resources)) {
    return (
      <section className={className} style={sectionStyle}>
        <div style={headerStyle}>{title}</div>
        <div>
          {resources.map((resource, idx) => (
            <ResourceItem 
              key={resource.id || resource.s3_key || idx} 
              resource={resource} 
              onDownload={onDownload}
              onDelete={onDelete}
              isLast={idx === resources.length - 1}
            />
          ))}
        </div>
      </section>
    )
  }

  // Fallback to original items logic for backward compatibility
  return (
    <section className={className} style={sectionStyle}>
      <div style={headerStyle}>{title}</div>
      <div>
        {Array.isArray(items) && items.map((label, idx) => (
          <ResourceItem key={label + idx} label={label} isLast={idx === items.length - 1} />
        ))}
      </div>
    </section>
  )
}
