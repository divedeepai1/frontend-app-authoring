import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ClassManagementForm = () => {
  // State for active step and form data
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    className: '',
    grade: '',
    periodNumber: '',
    selectedCourses: [],
    preferences: {
      cantRedoCompletedLessons: false,
      enableClassScoreboard: false,
      disableAccountChanges: false,
      hideThePauseButton: false,
      studentsCanChangePassword: false,
      showRestartButton: false,
    },
    message: '',
    dateRange: ''
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox changes for preferences
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [name]: checked
      }
    });
  };

  // Handle course selection
  const handleCourseSelection = (courseId) => {
    const updatedCourses = [...formData.selectedCourses];
    
    if (updatedCourses.includes(courseId)) {
      const index = updatedCourses.indexOf(courseId);
      updatedCourses.splice(index, 1);
    } else {
      updatedCourses.push(courseId);
    }
    
    setFormData({
      ...formData,
      selectedCourses: updatedCourses
    });
  };

  // Navigation functions
  const nextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
  };

  // Render progress indicator
  const renderProgressIndicator = () => {
    const steps = [
      { id: 1, name: 'Class Details' },
      { id: 2, name: 'Add Students' },
      { id: 3, name: 'Assign Course(s)' },
      { id: 4, name: 'Class Preferences' },
      { id: 5, name: 'Send Messages' }
    ];

    return (
      <div className="d-flex justify-content-between mb-4">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className="position-relative d-flex align-items-center"
            style={{ width: '20%' }}
          >
            <div 
              className={`w-100 py-3 text-center text-white ${activeStep === step.id ? 'bg-primary' : 'bg-secondary'}`}
              style={{ 
                clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)',
                paddingLeft: '20px',
                paddingRight: '20px',
                zIndex: step.id
              }}
            >
              {step.name}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render form based on active step
  const renderForm = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="p-4 bg-light rounded border">
            <h3 className="text-primary mb-4">Class Details</h3>
            <div className="mb-3">
              <label htmlFor="className" className="form-label">Class Name *</label>
              <input
                type="text"
                className="form-control"
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
                  className="form-control"
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
                  className="form-control"
                  id="periodNumber"
                  name="periodNumber"
                  value={formData.periodNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="d-flex mt-4">
              <button className="btn btn-primary me-2" onClick={nextStep}>Next</button>
              <button className="btn btn-outline-secondary">Cancel</button>
              <div className="ms-auto">
                <a href="#" className="text-primary">Save Information for Later</a>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="p-4 bg-light rounded border">
            <h3 className="text-primary mb-3">Add Students</h3>
            <p className="mb-4">Select how would you like to add new students to this class.</p>
            
            <div className="row">
              <div className="col-md-3">
                <div className="card h-100 text-center">
                  <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <div className="mb-2 fs-1">+</div>
                    <h5>Add a Single Student</h5>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card h-100 text-center">
                  <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <div className="mb-2 fs-1">+</div>
                    <h5>Add Bulk Students</h5>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card h-100 text-center">
                  <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <div className="mb-2 fs-1">+</div>
                    <h5>Self-Joining Link</h5>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card h-100 text-center">
                  <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <div className="mb-2 fs-1">+</div>
                    <h5>Import List of Students</h5>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="d-flex mt-5">
              <button className="btn btn-primary me-2" onClick={nextStep}>Next</button>
              <button className="btn btn-outline-secondary" onClick={prevStep}>Back</button>
              <div className="ms-auto">
                <a href="#" className="text-primary">Save Information for Later</a>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="p-4 bg-light rounded border">
            <h3 className="text-primary mb-3">Assign Courses</h3>
            <p className="mb-4">These are your purchased courses and you can assign multiple courses to any class.</p>
            
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <div className="form-check float-end">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="word"
                        checked={formData.selectedCourses.includes('word')}
                        onChange={() => handleCourseSelection('word')}
                      />
                    </div>
                    <div className="text-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg" alt="Word" style={{ width: '60px', height: '60px' }} />
                      <h5 className="mt-2">LBD Microsoft 365<br />Word-1</h5>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <div className="form-check float-end">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="excel"
                        checked={formData.selectedCourses.includes('excel')}
                        onChange={() => handleCourseSelection('excel')}
                      />
                    </div>
                    <div className="text-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg" alt="Excel" style={{ width: '60px', height: '60px' }} />
                      <h5 className="mt-2">LBD Microsoft 365<br />Excel-1</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="btn btn-outline-primary mb-4">View Course Library</button>
            
            <div className="d-flex">
              <button className="btn btn-primary me-2" onClick={nextStep}>Next</button>
              <button className="btn btn-outline-secondary" onClick={prevStep}>Back</button>
              <div className="ms-auto">
                <a href="#" className="text-primary">Save Information for Later</a>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="p-4 bg-light rounded border">
            <h3 className="text-primary mb-4">Set Class Preferences</h3>
            
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="cantRedoCompletedLessons"
                  name="cantRedoCompletedLessons"
                  checked={formData.preferences.cantRedoCompletedLessons}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="cantRedoCompletedLessons">
                  Can't redo completed lessons
                </label>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="enableClassScoreboard"
                  name="enableClassScoreboard"
                  checked={formData.preferences.enableClassScoreboard}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="enableClassScoreboard">
                  Enable Class Scoreboard
                </label>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="disableAccountChanges"
                  name="disableAccountChanges"
                  checked={formData.preferences.disableAccountChanges}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="disableAccountChanges">
                  Disable account changes
                </label>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="hideThePauseButton"
                  name="hideThePauseButton"
                  checked={formData.preferences.hideThePauseButton}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="hideThePauseButton">
                  Hide the pause button
                </label>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="studentsCanChangePassword"
                  name="studentsCanChangePassword"
                  checked={formData.preferences.studentsCanChangePassword}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="studentsCanChangePassword">
                  Students can change password
                </label>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showRestartButton"
                  name="showRestartButton"
                  checked={formData.preferences.showRestartButton}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="showRestartButton">
                  Show restart button
                </label>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="cantRedoCompletedLessons2"
                  name="cantRedoCompletedLessons"
                  checked={formData.preferences.cantRedoCompletedLessons}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="cantRedoCompletedLessons2">
                  Can't redo completed lessons
                </label>
              </div>
            </div>
            
            <div className="d-flex mt-4">
              <button className="btn btn-primary me-2" onClick={nextStep}>Next</button>
              <button className="btn btn-outline-secondary" onClick={prevStep}>Back</button>
              <div className="ms-auto">
                <a href="#" className="text-primary">Save Information for Later</a>
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="p-4 bg-light rounded border">
            <h3 className="text-primary mb-4">Send Messages to Class</h3>
            
            <div className="row mb-4">
              <div className="col-md-12 text-end">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Select Date Range"
                    name="dateRange"
                    value={formData.dateRange}
                    onChange={handleInputChange}
                  />
                  <span className="input-group-text">
                    <i className="bi bi-calendar"></i>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <textarea
                className="form-control"
                rows="10"
                placeholder="Type your message/announcement here..."
                name="message"
                value={formData.message}
                onChange={handleInputChange}
              ></textarea>
            </div>
            
            <div className="d-flex">
              <button className="btn btn-primary me-2">Create Class</button>
              <button className="btn btn-outline-secondary" onClick={prevStep}>Back</button>
              <div className="ms-auto">
                <a href="#" className="text-primary">Save Information for Later</a>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mt-4 mb-5">
      {renderProgressIndicator()}
      {renderForm()}
    </div>
  );
};

export default ClassManagementForm;