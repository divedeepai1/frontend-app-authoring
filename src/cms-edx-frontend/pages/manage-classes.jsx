import HeaderTop from "../../header";
import { Header } from "../components/header";
import ClassManagementForm from "../components/classes/manage-classes";
import { Container } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router";
import { fetchCsrfToken } from "../../cms-csrftoken";
import { getConfig } from "@edx/frontend-platform";
import AddTeacher from "../components/classes/add-teacher";
import { useEffect, useState } from "react";

const ManageClasses = () => {
  const location = useLocation(); 
  const navigate =useNavigate();
  const isNewTeacher = location.pathname.endsWith("/add-teacher");
  const isNewStudent = location.pathname.endsWith("/add-student");

  const [selectedTeachers, setSelectedTeachers] = useState([]);

  const [teachers, setTeachers] = useState([]);
    const fetchTeachers = async () => {
      const token = await fetchCsrfToken();
      try {
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/myplugin/teachers/`,
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
        setTeachers(result?.teachers);
      } catch (error) {
        console.error("Error:", error.message);
      }
    };
  
    useEffect(() => {
      if(isNewTeacher){
        fetchTeachers();
      }
    }, []);



  const handleNextStep = async (e) => {
    e.preventDefault();

    const token = await fetchCsrfToken();
    const classId=sessionStorage.getItem("classId")
    const teachers = selectedTeachers.map(teacher => teacher.email);

    try {
    
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/teachers/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify({ email: teachers })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add: ${response.status} ${errorText}`);
      }
      const result = await response.json();
       navigate(-1)
    } catch (error) {
      console.error("Error:", error.message);
    }
    
   
  };
 
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
        <section className="py-2 px-5">
          <Container>
            <div className="d-flex">
              <div style={{ width: "70%" }}>
                <div className="py-3 d-flex justify-content-between">
                  <h3 className="primary-text mb-4">
                    {sessionStorage.getItem("classData")
                      ? JSON.parse(sessionStorage.getItem("classData") || "{}")
                          ?.name
                      : "Class Name"}
                  </h3>
                 {!isNewTeacher && !isNewStudent &&<button className="outline-black-button fw-bold px-3">
                    + Add More Teachers
                  </button>}
                </div>
                {!isNewTeacher ? <ClassManagementForm  isNewStudent={isNewStudent}/> :<AddTeacher
                  teachers={teachers}
                  selectedTeachers={selectedTeachers}
                  setSelectedTeachers={setSelectedTeachers}
                  nextStep={handleNextStep}
                 />}
              </div>
              <div style={{ width: "30%" }}></div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
};

export default ManageClasses;
