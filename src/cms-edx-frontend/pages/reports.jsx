
import StudentDashboard from '../components/student-detail/student-dashboard';
import HeaderTop from '../../header';
import { Header } from '../components/header';
import ReportsDashboard from '../components/reports/reports';
import { Container} from "react-bootstrap"


const Reports = () => {
    return (
       <div>
         <HeaderTop isHiddenMainMenu/>
        <div className="min-vh-100 bg-white">
        <Header heading="Reports" bg="linear-gradient(90deg, #255A71 0%, #0096D7 100%)"  color="white" outline="outline-white-button"/>
        <section className="py-2 px-5">
        <Container>
          {/* <StudentDashboard /> */}
          <ReportsDashboard />
          </Container>
        </section>
        </div>
       </div>
       
    );
};

export default Reports;