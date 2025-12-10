import { useEffect, useState } from "react";
import SingleStudentForm from "../student-feed/forms/single-student-form";
import BulkStudentForm from "../student-feed/forms/bulk-student-form";
import CsvImportForm from "../student-feed/forms/import-student-list-form";
import SelfJoinLinkForm from "../student-feed/forms/self-joining-students";
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../../cms-csrftoken";
import StudentTable from "./students-table";
import SaveInformationForLater from "./save-information-for-later";

const StudentDetails = ({ nextStep, prevStep, isNewStudent }) => {
  const [addStudents,setAddStudents] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, [addStudents]);

  const fetchStudents = async () => {
    const classId = sessionStorage.getItem("classId")
    const token = await fetchCsrfToken();
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/students-list/`,
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
      setStudents(result?.students || []);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleStudentAdded = async () => {
    setSelectedOption(null);
    setAddStudents(false);
    await fetchStudents();
  };

  const renderForm = () => {
    switch (selectedOption) {
      case "single":
        return <SingleStudentForm setSelectedOption={setSelectedOption} isNewStudent={isNewStudent} setAddStudents={setAddStudents} onStudentAdded={handleStudentAdded} />;
      case "bulk":
        return <BulkStudentForm setSelectedOption={setSelectedOption} isNewStudent={isNewStudent} setAddStudents={setAddStudents} />;
      case "csv":
        return <CsvImportForm setSelectedOption={setSelectedOption} isNewStudent={isNewStudent} setAddStudents={setAddStudents} onStudentAdded={handleStudentAdded} />;
      case "link":
        return <SelfJoinLinkForm setSelectedOption={setSelectedOption} isNewStudent={isNewStudent} setAddStudents={setAddStudents} />;
      default:
        return null;
    }
  };

  return (
    <>
      {students.length > 0 && (!addStudents && !isNewStudent && !selectedOption)? <StudentTable students={students} setAddStudents={setAddStudents} nextStep={nextStep} prevStep={prevStep} />:
      <div className="p-4 class-div-style">
        <h3 className="primary-text mb-3">Add Students</h3>
        <p className="mb-3">
          Select how would you like to add new students to this class.
        </p>

        <div className="row" style={{ fontSize: "18px", fontWeight: "600" }}>
          <div className="col-md-3" onClick={() => setSelectedOption("single")}>
            <div className="card h-100 text-center clickable">
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <div className="mb-1 fs-1">+</div>
                <p>Add a Single Student</p>
              </div>
            </div>
          </div>

          <div className="col-md-3" disabled onClick={() => setSelectedOption("bulk")}>
            <div className="card h-100 text-center clickable">
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <div className="mb-1 fs-1">+</div>
                <p>Add Bulk Students</p>
              </div>
            </div>
          </div>

          <div className="col-md-3" disabled onClick={() => setSelectedOption("link")}>
            <div className="card h-100 text-center clickable">
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <div className="mb-1 fs-1">+</div>
                <p>Self-Joining Link</p>
              </div>
            </div>
          </div>

          <div className="col-md-3" onClick={() => setSelectedOption("csv")}>
            <div className="card h-100 text-center clickable">
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <div className="mb-1 fs-1">+</div>
                <p>Import List of Students</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">{renderForm()}</div>

       {!isNewStudent && <div className="d-flex mt-4 justify-content-between">
          <div className="d-flex">
            <button className="primary-button px-4 py-2" onClick={nextStep}>
              Next
            </button>
            <button
              className="secondary-button px-3  py-2 ml-3"
              onClick={prevStep}
            >
              Back
            </button>
          </div>
          <SaveInformationForLater />
        </div>}
      </div>}
    </>
  );
};

export default StudentDetails;
