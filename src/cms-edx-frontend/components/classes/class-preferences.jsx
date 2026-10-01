import CustomCheckbox from "./custom-checkbox";
import SaveInformationForLater from "./save-information-for-later";

const ClassPreferences = ({
  formData,
  handleCheckboxChange,
  nextStep,
  prevStep,
}) => (
  <div className="p-4 class-div-style">
    <h3 className="primary-text mb-4">Set Class Preferences</h3>
    <CustomCheckbox
    id="cantRedoCompletedLessons"
    name="cantRedoCompletedLessons"
    label="Can't redo completed lessons"
    checked={formData.preferences.cantRedoCompletedLessons}
    onChange={handleCheckboxChange}
  />

  {/* <CustomCheckbox
    id="enableClassScoreboard"
    name="enableClassScoreboard"
    label="Enable Class Scoreboard"
    checked={formData.preferences.enableClassScoreboard}
    onChange={handleCheckboxChange}
  /> */}

  {/* <CustomCheckbox
    id="disableAccountChanges"
    name="disableAccountChanges"
    label="Disable account changes"
    checked={formData.preferences.disableAccountChanges}
    onChange={handleCheckboxChange}
  /> */}

  {/* <CustomCheckbox
    id="hideThePauseButton"
    name="hideThePauseButton"
    label="Hide the pause button"
    checked={formData.preferences.hideThePauseButton}
    onChange={handleCheckboxChange}
  /> */}

  <CustomCheckbox
    id="studentsCanChangePassword"
    name="studentsCanChangePassword"
    label="Allow students to change password"
    checked={formData.preferences.studentsCanChangePassword}
    onChange={handleCheckboxChange}
  />

  {/* <CustomCheckbox
    id="showRestartButton"
    name="showRestartButton"
    label="Show restart button"
    checked={formData.preferences.showRestartButton}
    onChange={handleCheckboxChange}
  /> */}

    <div className="d-flex  justify-content-between">
      <div className="d-flex">
        <button className="primary-button px-4 py-2" onClick={nextStep}>
          Next
        </button>
        <button className="secondary-button px-4 ml-3" onClick={prevStep}>
          Back
        </button>
      </div>
      <SaveInformationForLater />
    </div>
  </div>
);
export default ClassPreferences;
