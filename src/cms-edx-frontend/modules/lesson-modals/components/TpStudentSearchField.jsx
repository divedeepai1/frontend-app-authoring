import { Search } from "lucide-react"

export default function TpStudentSearchField({ value, onChange, placeholder, disabled }) {
  return (
    <div className="tp-lesson-modal-search">
      <Search size={18} className="tp-lesson-modal-search-icon" aria-hidden />
      <input
        type="search"
        className="tp-lesson-modal-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  )
}
