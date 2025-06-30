import React from 'react';
import { useNavigate } from 'react-router';

const ClassDetails = ({ formData, handleInputChange, nextStep }) => {
  const navigate = useNavigate();

  return (
  <form onSubmit={(e)=>nextStep(e)} className="p-4 class-div-style">
    <h3 className="primary-text mb-4">Class Details</h3>
    <div className="mb-3">
      <label htmlFor="name" className="form-label">Class Name *</label>
      <input
        type="text"
        className="form-control bg-transparent"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        required
      />
    </div>
    <div className="row mb-3">
      <div className="col-md-6">
        <label htmlFor="grade" className="form-label">Grade*</label>
        <input
          type="number"
          min="1"
          step="1"
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === 'e' ||  e.key == 0) e.preventDefault();
          }}
          className="form-control bg-transparent"
          id="grade"
          name="grade"
          value={formData.grade}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="col-md-6">
        <label htmlFor="period" className="form-label">Period Number*</label>
        <input
          type="number"
          min="1"
          step="1"
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === 'e' ||  e.key == 0) e.preventDefault();
          }}
          className="form-control bg-transparent"
          id="period"
          name="period"
          value={formData.period}
          onChange={handleInputChange}
          required
        />
      </div>
    </div>
    <div className="d-flex mt-4">
      <button className="primary-button px-4 py-2" >Next</button>
      <button className="secondary-button px-3  py-2 ml-3" onClick={(e)=> navigate("/classes")}>Cancel</button>
    </div>
  </form>
);

}

export default ClassDetails;