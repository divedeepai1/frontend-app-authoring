
import HeaderTop from '../../header';
import { Header } from '../components/header';
import ClassesaTable from '../components/classes/classes-table';
import { Container} from "react-bootstrap"
import { useNavigate } from "react-router";
import { fetchCsrfToken } from "../../cms-csrftoken";
import { getConfig } from "@edx/frontend-platform";
import { useEffect, useState } from 'react';

const Classes = () => {
  const [classes, setClasses] = useState([]);
   const fetchClasses = async () => {
      const token = await fetchCsrfToken();
      try {
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/myplugin/classrooms/`,
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
        setClasses(result?.classrooms);
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    useEffect(() => {
      sessionStorage.removeItem("classId");
      sessionStorage.removeItem("classData");
      fetchClasses();
    }, []);
  const navigate = useNavigate();
    return (
       <div>
         <HeaderTop isHiddenMainMenu/>
        <div className="min-vh-100 bg-white">
        <Header heading="Manage Classes & Students" bg="linear-gradient(90deg, #255A71 0%, #0096D7 100%)"  color="white" outline="outline-white-button"/>
        <section className="py-2 px-5">
           <Container>
          <div className="py-3">
            <button className="outline-black-button py-2 px-3" onClick={(e)=> navigate(`/manage-classes/${1}`)}>+ Add a New Class</button>
            <button className="outline-black-button py-2 px-3 ml-3">+ Add New Teacher</button>
            <button className="outline-black-button py-2 px-3 ml-3">Print Completion certificate</button>
            <button className="outline-black-button py-2 px-3 ml-3">Print Parent Letter </button>
          </div>
          <ClassesaTable  classes={classes} setClasses={setClasses}/>

          </Container>
        </section>
        </div>
       </div>
       
    );
};

export default Classes;