
import HeaderTop from '../../header';
import { Header } from '../components/header';
import CourseScreen from '../components/courses/course-screen';
import { Container} from "react-bootstrap"


const Courses = () => {
    return (
       <div>
         <HeaderTop isHiddenMainMenu/>
        <div className="min-vh-100 bg-white">
        <Header heading="Manage Courses & Curriculum" bg="linear-gradient(90deg, #255A71 0%, #0096D7 100%)"  color="white" outline="outline-white-button"/>
        <section className="py-2 px-5">
        <Container>
          <CourseScreen />
          </Container>
        </section>
        </div>
       </div>
       
    );
};

export default Courses;