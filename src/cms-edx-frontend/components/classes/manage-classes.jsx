import React, { useEffect, useState } from "react";
import ProgressIndicator from "./progress-indicator";
import ClassDetails from "./class-details";
import AddStudent from "./add-student";
import AssignCourses from "./assign-courses";
import ClassPreferences from "./class-preferences";
import Messages from "./send-messages";
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../../cms-csrftoken";
import { useNavigate, useParams } from "react-router";
import { Announcement } from "@openedx/paragon/icons";

const ClassManagementForm = () => {
  const { step } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const initialStep = Math.max(parseInt(step, 10) || 1, 1);
  const [activeStep, setActiveStep] = useState(initialStep);
  const [activeStepList, setActiveStepList] = useState([1]);
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    period: "",
    courses: [],
    preferences: {
      cantRedoCompletedLessons: false,
      enableClassScoreboard: false,
      disableAccountChanges: false,
      hideThePauseButton: false,
      studentsCanChangePassword: false,
      showRestartButton: false,
    },
    announcement: "",
  });

  useEffect(() => {
    const data = sessionStorage.getItem("classData");
  
    if (data) {
      const parsedData = JSON.parse(data);
      const classIds = parsedData.courses?.map(course => course.id) || [];
      setFormData({
        ...parsedData,
        courses: classIds,
      });
    }
  
    fetchCourses();
  }, []);

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

  const handleCourseSelection = (id) => {
    const updatedCourses = [...formData.courses];

    if (updatedCourses.includes(id)) {
      const index = updatedCourses.indexOf(id);
      updatedCourses.splice(index, 1);
    } else {
      updatedCourses.push(id);
    }

    setFormData({
      ...formData,
      courses: updatedCourses,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = async (e) => {
    const classId = sessionStorage.getItem("classId")
    e.preventDefault();
    setActiveStepList((activeStepList) => [...activeStepList, activeStep]);
    
    if (activeStep == 1) {
      const token = await fetchCsrfToken();

      const data = JSON.stringify({
        name: formData.name,
        grade: formData.grade,
        period: formData.period,
      });
      try {
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}${classId ? `/myplugin/classrooms/${classId}/` : `/myplugin/classrooms/`}`,
          {
            method: classId ? "PUT" :"POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": token,
            },
            body: data,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to add: ${response.status} ${errorText}`);
        }
        const result = await response.json();
        console.log("class added successfully:", result);
        if(!sessionStorage.setItem("classId", result.id)){
        sessionStorage.setItem("classId", result.id);
        }
      } catch (error) {
        console.error("Error in adding:", error.message);
      }
    }

    if (activeStep == 3) {
      const token = await fetchCsrfToken();

      const data = JSON.stringify({
        courses: formData.courses,
       
      });
      try {
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/courses/`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": token,
            },
            body: data,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to add: ${response.status} ${errorText}`);
        }
        const result = await response.json();
        console.log("courses added successfully:", result);

      } catch (error) {
        console.error("Error in adding:", error.message);
      }
    }

    if (activeStep == 4) {
      const token = await fetchCsrfToken();

      const data = JSON.stringify({
        preferences: formData.preferences,
       
      });
      try {
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": token,
            },
            body: data,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to add: ${response.status} ${errorText}`);
        }
        const result = await response.json();
        console.log("preferences added", result);

      } catch (error) {
        console.error("Error in adding:", error.message);
      }
    }

    if (activeStep == 5) {
      const token = await fetchCsrfToken();

      const data = JSON.stringify({
        announcement: formData.announcement,
       
      });
      try {
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/announcements/`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": token,
            },
            body: data,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to add: ${response.status} ${errorText}`);
        }
        const result = await response.json();
        navigate("/classes")

      } catch (error) {
        console.error("Error in adding:", error.message);
      }
    }
   if(step < 5 ){
    setActiveStep((prev) => prev + 1);
    navigate(`/manage-classes/${activeStep + 1}`);
  }
  };

  const fetchCourses = async () => {
    const token = await fetchCsrfToken();
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/courses/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get: ${response.status} ${errorText}`);
      }
      const result = await response.json();
      setCourses(result);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const prevStep = () => {
    setActiveStep((prev) => prev - 1);
    setActiveStepList((prev) => prev.slice(0, -1));
    navigate(`/manage-classes/${activeStep - 1}`);
  };

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
            courses={courses}
            setCourses={setCourses}
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
      <ProgressIndicator
        activeStep={activeStep}
        activeStepList={activeStepList}
      />
      {renderForm()}
    </div>
  );
};

export default ClassManagementForm;
