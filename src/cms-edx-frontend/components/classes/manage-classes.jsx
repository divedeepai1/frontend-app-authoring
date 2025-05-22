import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ProgressIndicator from "./progress-indicator";
import ClassDetails from "./class-details";
import AddStudent from "./add-student";
import AssignCourses from "./assign-courses";
import ClassPreferences from "./class-preferences";
import Messages from "./send-messages";

const ClassManagementForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    className: "",
    grade: "",
    periodNumber: "",
    selectedCourses: [],
    preferences: {
      cantRedoCompletedLessons: false,
      enableClassScoreboard: false,
      disableAccountChanges: false,
      hideThePauseButton: false,
      studentsCanChangePassword: false,
      showRestartButton: false,
    },
    message: "",
    dateRange: "",
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [name]: checked,
      },
    });
  };

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
      selectedCourses: updatedCourses,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = (e) => {
    e.preventDefault();
    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => setActiveStep((prev) => prev - 1);

  const renderForm = () => {
    switch (activeStep) {
      case 1:
        return (
          <ClassDetails
            formData={formData}
            handleInputChange={handleInputChange}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <AddStudent
            formData={formData}
            handleInputChange={handleInputChange}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <AssignCourses
            formData={formData}
            handleCourseSelection={handleCourseSelection}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <ClassPreferences
            formData={formData}
            handleCheckboxChange={handleCheckboxChange}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5:
        return (
          <Messages
            formData={formData}
            handleInputChange={handleInputChange}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mb-5 border rounded shadow-sm p-5">
      <ProgressIndicator activeStep={activeStep} />
      {renderForm()}
    </div>
  );
};

export default ClassManagementForm;
