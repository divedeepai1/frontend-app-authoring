import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router"
import { Search, X } from "lucide-react"

function getTeacherEmail(teacher) {
  return String(teacher?.email || "").trim()
}

const AddTeacher = ({
  teachers,
  loadingTeachers = false,
  selectedTeachers,
  setSelectedTeachers,
  nextStep,
}) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const searchWrapRef = useRef(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const [dropdownPosition, setDropdownPosition] = useState(null)

  const openDropdown = useCallback(() => {
    setIsOpen(true)
  }, [])

  const updateDropdownPosition = useCallback(() => {
    const wrap = wrapperRef.current
    if (!wrap) return
    const rect = wrap.getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    })
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target
      if (searchWrapRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return
      }
      setIsOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  useLayoutEffect(() => {
    if (!isOpen) {
      setDropdownPosition(null)
      return undefined
    }

    updateDropdownPosition()

    const handleReposition = () => updateDropdownPosition()
    window.addEventListener("resize", handleReposition)
    window.addEventListener("scroll", handleReposition, true)

    return () => {
      window.removeEventListener("resize", handleReposition)
      window.removeEventListener("scroll", handleReposition, true)
    }
  }, [isOpen, updateDropdownPosition, selectedTeachers.length, searchTerm, loadingTeachers, teachers.length])

  const getFilteredTeachers = useCallback(() => {
    const query = searchTerm.trim().toLowerCase()

    return (teachers || []).filter((teacher) => {
      const email = getTeacherEmail(teacher).toLowerCase()
      if (!email) return false
      const matchesSearch = !query || email.includes(query)
      const notSelected = !selectedTeachers.some((sel) => sel.email === teacher.email)
      return matchesSearch && notSelected
    })
  }, [teachers, searchTerm, selectedTeachers])

  const filteredOptions = getFilteredTeachers()
  const showDropdown = isOpen

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
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

  const dropdownList = showDropdown && dropdownPosition ? (
    <ul
      ref={dropdownRef}
      id="tp-add-teacher-listbox"
      className="tp-add-teacher-dropdown tp-add-teacher-dropdown--portal"
      role="listbox"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
      }}
    >
      {loadingTeachers ? (
        <li className="tp-add-teacher-dropdown-empty" role="presentation">
          Loading teachers…
        </li>
      ) : null}
      {!loadingTeachers && filteredOptions.length === 0 ? (
        <li className="tp-add-teacher-dropdown-empty" role="presentation">
          No teachers found
        </li>
      ) : null}
      {!loadingTeachers
        ? filteredOptions.map((teacher) => (
            <li key={teacher.email} role="option">
              <button
                type="button"
                tabIndex={-1}
                className="tp-add-teacher-dropdown-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectTeacher(teacher)}
              >
                {getTeacherEmail(teacher)}
              </button>
            </li>
          ))
        : null}
    </ul>
  ) : null

  return (
    <div className="tp-mc-add-teacher-form">
      <form onSubmit={(e) => nextStep(e)} className="tp-mc-add-teacher-fields">
        <div className="tp-field tp-mc-add-teacher-field">
          <label className="tp-label" htmlFor="tp-add-teacher-search">
            Email address <span className="tp-required">*</span>
          </label>

          <div className="tp-add-teacher-combobox-wrap" ref={wrapperRef}>
            <div
              className="tp-add-teacher-combobox"
              role="combobox"
              aria-expanded={showDropdown}
              aria-haspopup="listbox"
              aria-controls="tp-add-teacher-listbox"
            >
              {selectedTeachers.map((teacher) => (
                <span key={teacher.email} className="tp-add-teacher-chip">
                  <span className="tp-add-teacher-chip-text">{getTeacherEmail(teacher)}</span>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="tp-add-teacher-chip-remove"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveTeacher(teacher.email)
                    }}
                    aria-label={`Remove ${getTeacherEmail(teacher)}`}
                  >
                    <X size={14} strokeWidth={2} aria-hidden />
                  </button>
                </span>
              ))}

              <div className="tp-add-teacher-search-wrap" ref={searchWrapRef}>
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
                  onFocus={openDropdown}
                  onClick={openDropdown}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedTeachers.length ? "Add another email…" : "Search by email…"}
                  autoComplete="off"
                />
              </div>
            </div>

            {typeof document !== "undefined" && dropdownList
              ? createPortal(<div className="cms-tp-scope">{dropdownList}</div>, document.body)
              : null}
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
