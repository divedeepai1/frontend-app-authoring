import HeaderTop from '../../header';
import { Header } from "../components/header";
import ClassManagementForm from "../components/classes/manage-classes";
import { Container } from "react-bootstrap";

const ManageClasses = () => {
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
            <div style={{width:"70%"}}>
              <div className="py-3 d-flex justify-content-between">
                <h3 className="primary-text mb-4">Class Name</h3>
                <button className="outline-black-button fw-bold px-3">
                  + Add New Teacher
                </button>
              </div>
              <ClassManagementForm />
            </div>
            <div style={{width:"30%"}}>

            </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
};

export default ManageClasses;
