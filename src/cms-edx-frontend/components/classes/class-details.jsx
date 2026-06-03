import React from "react"
import { useNavigate } from "react-router"

const ClassDetails = ({ formData, handleInputChange, nextStep, embedInModal = false }) => {
  const navigate = useNavigate()

  const blockInvalidNumberKeys = (e) => {
    if (e.key === "-" || e.key === "e" || (e.key === "0" && e.target.value.length === 0)) e.preventDefault()
  }

  return (
    <form
      id={embedInModal ? "tp-mc-class-details-form" : undefined}
      onSubmit={nextStep}
      className="tp-class-details"
    >
      <h3 className="tp-title">Class Details</h3>
      <p className="tp-subtitle">Name your class. Grade and period are optional.</p>
      <div className="tp-field">
        <label htmlFor="name" className="tp-label">
          Class Name *
        </label>
        <input
          type="text"
          className="tp-input"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="tp-grid-2 tp-field-row">
        <div>
          <label htmlFor="grade" className="tp-label">
            Grade (optional)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            onKeyDown={blockInvalidNumberKeys}
            className="tp-input"
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="period" className="tp-label">
            Period number (optional)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            onKeyDown={blockInvalidNumberKeys}
            className="tp-input"
            id="period"
            name="period"
            value={formData.period}
            onChange={handleInputChange}
          />
        </div>
      </div>
      {!embedInModal ? (
        <div className="tp-actions-row">
          <button type="submit" className="tp-btn tp-btn-primary">
            Next
          </button>
          <button type="button" className="tp-btn tp-btn-secondary" onClick={() => navigate("/classes")}>
            Cancel
          </button>
        </div>
      ) : null}
    </form>
  )
}

export default ClassDetails
