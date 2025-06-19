import {Container} from "react-bootstrap"
import { useNavigate } from "react-router";
const Header = ({button}) => {

    const navigate =useNavigate();
    return (
                <div className="mb-4 border-bottom py-3">
                 <Container>
                  <div className="d-flex justify-content-between">
                  <div>
                  <h2 className="fw-bold mb-1" style={{ fontSize: "1.5rem", color: "#333",fontWeight:"600"}}>
                    Create New Quiz
                  </h2>
                  <p className="mb-0" style={{ fontSize: "0.95rem"}}>
                    Create and manage multi-question quizzes
                  </p>
                  </div>
                  {button &&<button className="primary-button px-3  mr-4" style={{height:"50px"}}onClick={(e) => navigate("/create-new-quiz")}>Create New Quiz</button>}
                  </div>
                  </Container>
                </div>
    );
    }
export default Header;