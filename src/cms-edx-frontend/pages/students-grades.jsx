import HeaderTop from "../../header";
import { Header } from "../components/header";
import { ManagementSection } from "../components/management-section";
import { Container } from "react-bootstrap";
import StudentDashboard from "../components/student-detail/student-dashboard";
import { useEffect, useState } from "react";


const StudentsGrades = () => {


    const [classData, setClassData] = useState(null);
    const [studentName, setStudentName] = useState('');
  
    useEffect(() => {
      const storedClassData = sessionStorage.getItem('classData');
      const storedStudentName = sessionStorage.getItem('student-name');
  
      if (storedClassData) {
        try {
          setClassData(JSON.parse(storedClassData));
        } catch (error) {
          console.error('Error parsing classData:', error);
        }
      }
  
      if (storedStudentName) {
        setStudentName(storedStudentName);
      }
    }, []);
      

  

  

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
                <StudentDashboard classData={classData} studentName={studentName} />
             
            </div>
          </Container>
        </section>
      </div>

     

    
    </div>
  );
};

export default StudentsGrades;
