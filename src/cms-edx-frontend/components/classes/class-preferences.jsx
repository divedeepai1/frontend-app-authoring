const ClassPreferences = ({ formData, handleCheckboxChange,nextStep, prevStep }) => (
<div className="p-4 class-div-style">
            <h3 className="primary-text mb-4">Set Class Preferences</h3>
                        <div className="mb-3">
             <div className="form-check">
                <input
               style={{width:'18px',height:'18px'}}
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
                  style={{width:'18px',height:'18px'}}
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
                  style={{width:'18px',height:'18px'}}
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
                  style={{width:'18px',height:'18px'}}
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
                  style={{width:'18px',height:'18px'}}
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
                  style={{width:'18px',height:'18px'}}
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
            
           
            
            <div className="d-flex  justify-content-between">
              <div className="d-flex">
              <button className="primary-button px-4 py-2" onClick={nextStep}>Next</button>
              <button className="secondary-button px-4 ml-3" onClick={prevStep}>Back</button>
              </div>
              <div className="ms-auto">
                <a href="#" className="primary-text">Save Information for Later</a>
              </div>
            </div>
          </div>
        );
export default ClassPreferences;