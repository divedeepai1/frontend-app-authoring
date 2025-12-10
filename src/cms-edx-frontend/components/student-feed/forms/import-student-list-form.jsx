import React, { useState } from 'react';
import { fetchCsrfToken } from '../../../../cms-csrftoken';
import { getConfig } from '@edx/frontend-platform';
import { useNavigate } from 'react-router';


const CsvImportForm = ({setSelectedOption,setAddStudents,isNewStudent, onStudentAdded}) => {
  const [csvFile, setCsvFile] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      alert("Please select a valid CSV file.");
      e.target.value = null;
      setCsvFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token= await fetchCsrfToken();
    const classId = sessionStorage.getItem("classId")
    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/add-students-csv/`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'X-CSRFToken': token,
        },
        body: formData
      });

      if (response.ok) {
        setCsvFile(null);
        document.getElementById("csv-file-input").value = null;
        if(isNewStudent){
          navigate(-1)
        }
        else{
          if (onStudentAdded) {
            onStudentAdded();
          } else {
            setAddStudents(false);
            setSelectedOption(null);
          }
        }
      
      } else {
      }
    } catch (error) {
      setCsvFile(null);
      Alert("An error occurred while uploading the file. Please try again.");
      document.getElementById("csv-file-input").value = null;
      console.error("Upload error:", error);
      
    }
  };

  const handleRemoveFile = () => {
    setCsvFile(null);
    document.getElementById("csv-file-input").value = null;
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="primary-text">Import CSV file</h3>
      <p className="mb-2 text-black" style={{ fontWeight: "600" }}>Your file</p>

      <input
        type="file"
        id="csv-file-input"
        accept=".csv"
        className="form-control mb-2 bg-transparent p-2"
        style={{ height: "50px" }}
        onChange={handleFileChange}
      />

      {csvFile && (
        <div className="mb-2">
          <span className="text-success">{csvFile.name}</span>
          <button
            type="button"
            className="btn btn-sm btn-danger ml-2"
            onClick={handleRemoveFile}
          >
            Remove
          </button>
        </div>
      )}

      <div className="mt-3">
        <button type="submit" className="primary-button px-4 py-2" disabled={!csvFile}>
          Add Students
        </button>
        <button
          type="button"
          className="secondary-button px-4 py-2 ml-3"
          onClick={() => setSelectedOption(null)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CsvImportForm;
