
import ResourceItem from "./resource-item"

export default function ResourceSection({ title, items, className }) {
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

  return (
    <section className={className} style={sectionStyle}>
      <div style={headerStyle}>{title}</div>
      <div>
        {items.map((label, idx) => (
          <ResourceItem key={label + idx} label={label} isLast={idx === items.length - 1} />
        ))}
      </div>
    </section>
  )
}
