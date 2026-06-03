import { Search } from "lucide-react"

export default function TpPortalSearchField({
  value,
  onChange,
  placeholder,
  disabled,
  className = "",
  id,
  "aria-label": ariaLabel,
}) {
  return (
    <div className={`tp-portal-search-field ${className}`.trim()}>
      <Search size={16} className="tp-portal-search-field-icon" aria-hidden />
      <input
        id={id}
        type="search"
        className="tp-portal-search-field-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={ariaLabel || placeholder}
      />
    </div>
  )
}
