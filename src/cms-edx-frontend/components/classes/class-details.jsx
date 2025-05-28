import React from 'react';

const ClassDetails = ({ formData, handleInputChange, nextStep }) => (
  <div className="p-4 class-div-style">
    <h3 className="primary-text mb-4">Class Details</h3>
    <div className="mb-3">
      <label htmlFor="className" className="form-label">Class Name *</label>
      <input
        type="text"
        className="form-control bg-transparent"
        id="className"
        name="className"
        value={formData.className}
        onChange={handleInputChange}
        required
      />
    </div>
    <div className="row mb-3">
      <div className="col-md-6">
        <label htmlFor="grade" className="form-label">Grade*</label>
        <input
          type="text"
          className="form-control bg-transparent"
          id="grade"
          name="grade"
          value={formData.grade}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="col-md-6">
        <label htmlFor="periodNumber" className="form-label">Period Number*</label>
        <input
          type="text"
          className="form-control bg-transparent"
          id="periodNumber"
          name="periodNumber"
          value={formData.periodNumber}
          onChange={handleInputChange}
          required
        />
      </div>
    </div>
    <div className="d-flex mt-4">
      <button className="primary-button px-4 py-2" onClick={nextStep}>Next</button>
      <button className="secondary-button px-3  py-2 ml-3">Cancel</button>
    </div>
  </div>
);

export default ClassDetails;