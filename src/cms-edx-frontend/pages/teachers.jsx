import HeaderTop from "../../header";
import { Header } from "../components/header";
import DeleteModal from "../components/common/delete-modal";
import { ManagementSection } from "../components/management-section";
import { Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { fetchCsrfToken } from "../../cms-csrftoken";
import { getConfig } from "@edx/frontend-platform";
import { useEffect, useState } from "react";
import TeachersTable from "../components/classes/teachers-table";
import StudentTable from "../components/classes/students-table";

const Teachers = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [teacherState, setTeacherState] = useState({
    list: [],
    selectedEmails: [],
    showDeleteModal: false,
  });

  const [studentState, setStudentState] = useState({
    list: [],
    selectedIds: [],
    showDeleteModal: false,
  });

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
      setTeacherState(prev => ({ ...prev, list: result?.all_teachers || [] }));
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
      setStudentState(prev => ({ ...prev, list: result?.students || [] }));
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    sessionStorage.setItem("classId", classId);
    fetchStudents();
    fetchTeachers();
  }, []);

  const handleSelectTeachers = (email) => {
    setTeacherState(prev => ({
      ...prev,
      selectedEmails: prev.selectedEmails.includes(email)
        ? prev.selectedEmails.filter((i) => i !== email)
        : [...prev.selectedEmails, email],
    }));
  };

  const handleSelectAllTeachers = () => {
    setTeacherState(prev => ({
      ...prev,
      selectedEmails:
        prev.selectedEmails.length === prev.list.length
          ? []
          : prev.list.map((t) => t.email),
    }));
  };

  const handleDeleteTeachers = async (email) => {
    if (!email?.target) {
      setTeacherState(prev => ({ ...prev, selectedEmails: [email] }));
    }
    setTeacherState(prev => ({ ...prev, showDeleteModal: true }));
  };

 

  const handleSelectStudents = (id) => {
    setStudentState(prev => ({
      ...prev,
      selectedIds: prev.selectedIds.includes(id)
        ? prev.selectedIds.filter((i) => i !== id)
        : [...prev.selectedIds, id],
    }));
  };

  const handleSelectAllStudents = () => {
    setStudentState(prev => ({
      ...prev,
      selectedIds:
        prev.selectedIds.length === prev.list.length
          ? []
          : prev.list.map((s) => s.id),
    }));
  };

  const handleDeleteStudents = async (id) => {
    
    if (!id?.target) {
      setStudentState(prev => ({ ...prev, selectedIds: [id] }));
    }
    setStudentState(prev => ({ ...prev, showDeleteModal: true }));
  };

  const deleteAllTeacher = async () => {
    const token = await fetchCsrfToken();
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/teachers/`, 
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify({
            emails: teacherState.selectedEmails,
          }),
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete: ${response.status} ${errorText}`);
      }
  
      
      await fetchTeachers();
      setTeacherState(prev => ({
        ...prev,
        selectedEmails: [],
        showDeleteModal: false,
      }));
    } catch (error) {
      console.error("Error deleting teachers:", error.message);
    }
  };
  
  const deleteAllStudent = async () => {
    const token = await fetchCsrfToken();
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/${classId}/students/`, 
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: JSON.stringify({
            students: studentState.selectedIds,
          }),
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete: ${response.status} ${errorText}`);
      }
  
      await fetchStudents();
      setStudentState(prev => ({
        ...prev,
        selectedIds: [],
        showDeleteModal: false,
      }));
    } catch (error) {
      console.error("Error deleting students:", error.message);
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
        <ManagementSection />
        <section className="px-5">
          <Container>
            <div style={{ width: "80%" }}>
              <div className="p-4 class-div-style-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="primary-text">Assigned Teachers</h3>
                  <div>
                    {teacherState.selectedEmails.length > 0 && (
                      <button
                        className="outline-black-button px-3 py-2 mr-3"
                        onClick={handleDeleteTeachers}
                      >
                        Remove Teachers
                      </button>
                    )}
                    <button
                      className="primary-button px-3 py-2"
                      onClick={() => navigate(`/manage-classes/add-teacher`)}
                    >
                      + Add More Teachers
                    </button>
                  </div>
                </div>
                <TeachersTable
                  teachers={teacherState.list}
                  selectedEmails={teacherState.selectedEmails}
                  handleDeleteTeachers={handleDeleteTeachers}
                  handleSelectAllTeachers={handleSelectAllTeachers}
                  handleSelectTeachers={handleSelectTeachers}
                />
              </div>
              <div className="p-4 class-div-style-2 mt-5 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="primary-text">Students Information</h3>
                  <div>
                    {studentState.selectedIds.length > 0 && (
                      <button
                        className="outline-black-button px-3 py-2 mr-3"
                        onClick={handleDeleteStudents}
                      >
                        Remove Students
                      </button>
                    )}
                    <button
                      className="primary-button px-3 py-2"
                      onClick={() => navigate(`/manage-classes/add-student`)}
                    >
                      + Add More Students
                    </button>
                  </div>
                </div>
                <StudentTable
                  students={studentState.list}
                  fromTeachers={true}
                  classId={classId}
                  selectedIds={studentState.selectedIds}
                  handleDeleteStudents={handleDeleteStudents}
                  handleSelectAllStudents={handleSelectAllStudents}
                  handleSelectStudents={handleSelectStudents}
                />
              </div>
            </div>
          </Container>
        </section>
      </div>

      <DeleteModal
        category="component"
        title="Are you sure you want to delete?"
        isOpen={teacherState.showDeleteModal}
        close={() =>
          setTeacherState(prev => ({
            ...prev,
            showDeleteModal: false,
          }))
        }
        description={"Teacher(s) will be removed from this class"}
        btnDefaultLabel={"Remove"}
        btnPendingLabel={"Deleting"}
        onDeleteSubmit={deleteAllTeacher}
      />

      <DeleteModal
        category="component"
        title="Are you sure you want to delete?"
        isOpen={studentState.showDeleteModal}
        close={() =>
          setStudentState(prev => ({
            ...prev,
            showDeleteModal: false,
          }))
        }
        description={"Student(s) will be removed from this class"}
        btnDefaultLabel={"Remove"}
        btnPendingLabel={"Deleting"}
        onDeleteSubmit={deleteAllStudent}
      />
    </div>
  );
};

export default Teachers;
