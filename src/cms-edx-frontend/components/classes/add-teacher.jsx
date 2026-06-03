import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate } from "react-router"
import { Search, X } from "lucide-react"

const AddTeacher = ({ teachers, selectedTeachers, setSelectedTeachers, nextStep }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  const getFilteredTeachers = useCallback(
    () =>
      (teachers || []).filter(
        (teacher) =>
          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedTeachers.some((sel) => sel.email === teacher.email),
      ),
    [teachers, searchTerm, selectedTeachers],
  )

  const filteredOptions = getFilteredTeachers()
  const showDropdown = isOpen && searchTerm.trim().length > 0 && filteredOptions.length > 0

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setIsOpen(true)
  }

  const handleSelectTeacher = (teacher) => {
    if (!selectedTeachers.some((t) => t.email === teacher.email)) {
      setSelectedTeachers([...selectedTeachers, teacher])
    }
    setSearchTerm("")
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleRemoveTeacher = (email) => {
    setSelectedTeachers(selectedTeachers.filter((t) => t.email !== email))
  }

  const handleComboboxClick = () => {
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false)
      return
    }
    if (e.key === "Backspace" && !searchTerm && selectedTeachers.length > 0) {
      const last = selectedTeachers[selectedTeachers.length - 1]
      handleRemoveTeacher(last.email)
    }
  }

  return (
    <div className="tp-mc-add-teacher-form">
      <form onSubmit={(e) => nextStep(e)} className="tp-mc-add-teacher-fields">
        <h3 className="tp-title tp-mc-add-teacher-heading">Add more teachers</h3>
        <p className="tp-subtitle tp-mc-add-teacher-desc">
          Search by email and select teachers to assign to this class.
        </p>

        <div className="tp-field tp-mc-add-teacher-field">
          <label className="tp-label" htmlFor="tp-add-teacher-search">
            Email address <span className="tp-required">*</span>
          </label>

          <div
            className={`tp-add-teacher-combobox-wrap${showDropdown ? " tp-add-teacher-combobox-wrap--open" : ""}`}
            ref={wrapperRef}
          >
            <div
              className={`tp-add-teacher-combobox${showDropdown ? " tp-add-teacher-combobox--open" : ""}`}
              onClick={handleComboboxClick}
              role="combobox"
              aria-expanded={showDropdown}
              aria-haspopup="listbox"
              aria-controls="tp-add-teacher-listbox"
            >
              {selectedTeachers.map((teacher) => (
                <span key={teacher.email} className="tp-add-teacher-chip">
                  <span className="tp-add-teacher-chip-text">{teacher.email}</span>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="tp-add-teacher-chip-remove"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveTeacher(teacher.email)
                    }}
                    aria-label={`Remove ${teacher.email}`}
                  >
                    <X size={14} strokeWidth={2} aria-hidden />
                  </button>
                </span>
              ))}

              <div className="tp-add-teacher-search-wrap">
                <Search size={16} className="tp-add-teacher-search-icon" aria-hidden />
                <input
                  ref={inputRef}
                  id="tp-add-teacher-search"
                  type="text"
                  role="searchbox"
                  aria-autocomplete="list"
                  aria-controls="tp-add-teacher-listbox"
                  className="tp-add-teacher-search-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedTeachers.length ? "Add another email…" : "Search by email…"}
                  autoComplete="off"
                />
              </div>
            </div>

            {showDropdown ? (
              <ul id="tp-add-teacher-listbox" className="tp-add-teacher-dropdown" role="listbox">
                {filteredOptions.map((teacher) => (
                  <li key={teacher.email} role="option">
                    <button
                      type="button"
                      tabIndex={-1}
                      className="tp-add-teacher-dropdown-item"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectTeacher(teacher)}
                    >
                      {teacher.email}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="tp-mc-add-teacher-actions">
          <button type="submit" className="tp-btn tp-btn-primary" disabled={selectedTeachers.length === 0}>
            Add teacher
          </button>
          <button type="button" className="tp-btn tp-btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddTeacher
