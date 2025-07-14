import HeaderTop from "../../header";
import { Header } from "../components/header";
import ClassesaTable from "../components/classes/classes-table";
import { ManagementSection } from "../components/management-section";

import { Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { fetchCsrfToken } from "../../cms-csrftoken";
import { getConfig } from "@edx/frontend-platform";
import { useEffect, useState } from "react";
import TeachersTable from "../components/classes/teachers-table";
import StudentTable from "../components/classes/students-table";

const Teachers = () => {
  const { classId} = useParams();
    
  const [teachers, setTeachers] = useState([]);
  const [students,setStudents]=useState([])
  const fetchTeachers = async () => {
    const token = await fetchCsrfToken();
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/teachers/`,
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
      setTeachers(result?.all_teachers);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

    const fetchStudents = async () => {
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

  useEffect(() => {
  
    sessionStorage.setItem("classId",classId);
    fetchStudents();
    fetchTeachers();
  }, []);
  const navigate = useNavigate();
  return (
    <div>
      <HeaderTop isHiddenMainMenu />
      <div className="min-vh-100 bg-white">
        <Header
          heading="Manage Classes & Students"
          bg="linear-gradient(90deg, #255A71 0%, #0096D7 100%)"
          color="white"
          outline="outline-white-button"
        />
        <ManagementSection />
        <section className="px-5">
          <Container>
            <div style={{ width: "80%" }}>
              <div className="p-4 class-div-style-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="primary-text">Assigned Teachers</h3>
                  <button className="primary-button px-3 py-2" onClick={() => navigate(`/manage-classes/add-teacher`)}> 
                    + Add More Teachers
                  </button>
                </div>
                <TeachersTable teachers={teachers} />
              </div>
              <div className="p-4 class-div-style-2 mt-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="primary-text">Students Information</h3>
                  <button className="primary-button px-3 py-2" onClick={() => navigate(`/manage-classes/add-teacher`)}> 
                    + Add More Students
                  </button>
                </div>
                <StudentTable students={students} fromTeachers={true} />
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
};

export default Teachers;
