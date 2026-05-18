import { Search } from "lucide-react"

export default function GradebookSearchField({ value, onChange, disabled }) {
  return (
    <div className="tp-gradebook-search">
      <Search size={16} className="tp-gradebook-search-icon" aria-hidden />
      <input
        type="search"
        className="tp-gradebook-search-input"
        placeholder="Search student here"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  )
}
