import "bootstrap/dist/css/bootstrap.min.css"
import HeaderTop from '../../header/Header';
import { Header } from '../components/header';
import ClassesaTable from '../components/classes/classes-table';
import ClassManagementForm from '../components/classes/manage-classes';
import { Container} from "react-bootstrap"


const Classes = () => {
    return (
       <div>
         <HeaderTop isHiddenMainMenu/>
        <div className="min-vh-100 bg-white">
        <Header heading="Manage Classes & Students" bg="linear-gradient(90deg, #255A71 0%, #0096D7 100%)"  color="white" outline="outline-white-button"/>
        <section className="py-2 px-5">
           <Container>
          <div className="py-3 ">
            <button className="outline-black-button py-2 px-3">+ Add a New Class</button>
            <button className="outline-black-button py-2 px-3 ml-3">+ Add New Teacher</button>
            <button className="outline-black-button py-2 px-3 ml-3">Print Completion certificate</button>
            <button className="outline-black-button py-2 px-3 ml-3">Print Parent Letter </button>
          </div>
          <ClassesaTable />
          {/* <ClassManagementForm /> */}
          </Container>
        </section>
        </div>
       </div>
       
    );
};

export default Classes;