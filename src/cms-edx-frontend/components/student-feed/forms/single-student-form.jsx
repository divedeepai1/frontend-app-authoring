import React, { useState } from "react";

import { fetchCsrfToken } from '../../../../cms-csrftoken';
import { getConfig } from '@edx/frontend-platform';
import { useNavigate } from "react-router";


const SingleStudentForm = ({ setSelectedOption ,setAddStudents, isNewStudent, onStudentAdded}) => {
  const navigate= useNavigate();
  const [studentData, setStudentData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === "firstName" || name === "lastName") && /[^a-zA-Z\s]/.test(value)) {
      return; 
    }
    setStudentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
          
              const id= sessionStorage.getItem('classId');
              const token= await fetchCsrfToken();
              
              const data = JSON.stringify({
                username: studentData.username,
                first_name: studentData.firstName,
                password: studentData.password,
                last_name: studentData.lastName,
                email: studentData.email,
              });
              try {
                const response = await fetch(`${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${id}/add-student/`, {
                  method: 'POST',
                  credentials: 'include',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': token,
                  },
                  body: data,
                });
              
                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(`Failed to add: ${response.status} ${errorText}`);
                }
                const result = await response.json();
                if(isNewStudent){
                  navigate(-1)
                }
                else{
                  if (onStudentAdded) {
                    onStudentAdded();
                  } else {
                    setAddStudents(false);
                  }
                }
              } catch (error) {
                console.error('Error in adding:', error.message);
                
              }
              };
    
    
  

  return (
    <form onSubmit={handleSubmit} className="p-4 class-div-style">
      <h3 className="primary-text">Add a Single Student to your class</h3>
      <div className="row">
        <div className="col-md-6 mt-3">
          <div className="mt-2">
            <label>Student's Username *</label>
            <input
              name="username"
              value={studentData.username}
              onChange={handleChange}
              required
              className="form-control bg-transparent mb-2"
            />
          </div>
          <div className="mt-2">
            <label>Student's First Name *</label>
            <input
              name="firstName"
              value={studentData.firstName}
              onChange={handleChange}
              required
              className="form-control bg-transparent mb-2"
            />
          </div>
        </div>
        <div className="col-md-6 mt-3">
          <div className="mt-2">
            <label>Student's Password *</label>
            <input
              name="password"
              value={studentData.password}
              onChange={handleChange}
              required
              className="form-control bg-transparent mb-2"
            />
          </div>
          <div className="mt-2">
            <label>Student's Last Name *</label>
            <input
              name="lastName"
              value={studentData.lastName}
              onChange={handleChange}
              required
              className="form-control bg-transparent mb-2"
            />
          </div>
        </div>
        <div className="col-md-12 mt-2">
          <label>Student Email Address *</label>
          <input
            type="email"
            name="email"
            value={studentData.email}
            onChange={handleChange}
            required
            className="form-control bg-transparent mb-2"
          />
        </div>
      </div>
      <div className="mt-2">
        <button className="primary-button px-4 py-2" type="submit">
          Add Student
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

export default SingleStudentForm;
