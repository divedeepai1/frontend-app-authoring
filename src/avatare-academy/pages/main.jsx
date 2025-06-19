import Header from "./../components/header"
import HeaderTop from '../../header';

import { Container, Row, Col,  Card ,Badge} from "react-bootstrap"
import { useEffect, useState } from "react";

import { fetchCsrfToken } from "../../cms-csrftoken";
import { getConfig } from "@edx/frontend-platform";






 const recentQuizzes = [
    {
      id: 1,
      title: "Chapter 3 : Introduction to Computer Science",
      type: "Multiple Choice",
      questions: 10,
      lastEdited: "Today",
      status: "Published",
    },
    {
      id: 2,
      title: "Chapter 3 : Introduction to Algorithms",
      type: "Multi-Component",
      questions: 15,
      lastEdited: "Today",
      status: "Drafts",
    },
    {
      id: 3,
      title: "Chapter 3 : Introduction to Computer Science",
      type: "Multiple Choice",
      questions: 10,
      lastEdited: "Today",
      status: "Published",
    },
    {
      id: 4,
      title: "Chapter 3 : Introduction to Computer Science",
      type: "Multiple Choice",
      questions: 10,
      lastEdited: "Today",
      status: "Published",
    },
    {
      id: 5,
      title: "Chapter 3 : Introduction to Computer Science",
      type: "Multiple Choice",
      questions: 10,
      lastEdited: "Today",
      status: "Drafts",
    },
    {
      id: 6,
      title: "Chapter 3 : Introduction to Computer Science",
      type: "Multiple Choice",
      questions: 10,
      lastEdited: "Today",
      status: "Published",
    },
    {
      id: 7,
      title: "Chapter 3 : Introduction to Computer Science",
      type: "Multiple Choice",
      questions: 10,
      lastEdited: "Today",
      status: "Published",
    },
    {
      id: 8,
      title: "Chapter 3 : Introduction to Computer Science",
      type: "Multiple Choice",
      questions: 10,
      lastEdited: "Today",
      status: "Drafts",
    },
    {
      id: 9,
      title: "Chapter 3 : Introduction to Computer Science",
      type: "Multiple Choice",
      questions: 10,
      lastEdited: "Today",
      status: "Published",
    },
  ]

 



const Main = () => {
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
   
        const PostCategory = async () => {
        const token= await fetchCsrfToken();
       
          try {
              const response = await fetch(`${getConfig().STUDIO_BASE_URL}/quizplugin/api/dashboard/`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': token,
                },
              });
            
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to add category: ${response.status} ${errorText}`);
              }
                const result = await response.json();
                setDashboardData(result);
              
             
            } catch (error) {
              console.error('Error:', error.message);
            }
        };
  
        PostCategory();
        
  
  
      
    }, []);
    return (
        <>
         <HeaderTop isHiddenMainMenu/>
     
 
      <Header  button={true}/>
      <Container >
        <Row className="mb-4" style={{ gap: "0" }}>
          <Col lg={4} className="pe-2">
            <Card
              className="border-0 shadow-sm"
              style={{
                borderRadius: "8px",
                backgroundColor: "white",
              }}
            >
              <Card.Body style={{ padding: "24px" }}>
                <h6
                  className="fw-semibold mb-1"
                  style={{
                    color: "#1a1a1a",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Total Quizzes
                </h6>
                <p
                  className="mb-3"
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "4px 0 16px 0",
                  }}
                >
                  All created quizzes
                </p>
                <h1
                  className="fw-bold mb-0"
                  style={{
                    fontSize: "48px",
                    color: "#1a1a1a",
                    fontWeight: "700",
                    lineHeight: "1",
                  }}
                >
                  {dashboardData && dashboardData.total_quizzes }
                </h1>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="px-2">
            <Card
              className="border-0 shadow-sm"
              style={{
                borderRadius: "8px",
                backgroundColor: "white",
              }}
            >
              <Card.Body style={{ padding: "24px" }}>
                <h6
                  className="fw-semibold mb-1"
                  style={{
                    color: "#1a1a1a",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Published Quizzes
                </h6>
                <p
                  className="mb-3"
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "4px 0 16px 0",
                  }}
                >
                  Quizzes available to students
                </p>
                <h1
                  className="fw-bold mb-0"
                  style={{
                    fontSize: "48px",
                    color: "#1a1a1a",
                    fontWeight: "700",
                    lineHeight: "1",
                  }}
                >
                  {dashboardData && dashboardData.published_quizzes}
                </h1>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="ps-2">
            <Card
              className="border-0 shadow-sm"
              style={{
                borderRadius: "8px",
                backgroundColor: "white",
              }}
            >
              <Card.Body style={{ padding: "24px" }}>
                <h6
                  className="fw-semibold mb-1"
                  style={{
                    color: "#1a1a1a",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Draft Quizzes
                </h6>
                <p
                  className="mb-3"
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "4px 0 16px 0",
                  }}
                >
                  Quizzes in progress
                </p>
                <h1
                  className="fw-bold mb-0"
                  style={{
                    fontSize: "48px",
                    color: "#1a1a1a",
                    fontWeight: "700",
                    lineHeight: "1",
                  }}
                >
                  {dashboardData && dashboardData.draft_quizzes}
                </h1>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Quizzes Section */}
        <div className="mb-4" style={{ marginTop: "40px" }}>
          <h4
            className="fw-bold"
            style={{
              color: "#1a1a1a",
              fontSize: "20px",
              fontWeight: "700",
              marginBottom: "24px",
            }}
          >
            Recent Quizzes
          </h4>
        </div>

        {/* Quiz Cards Grid */}
        <Row style={{ gap: "0" }}>
          {dashboardData?.recent_quizzes?.map((quiz) => (
            <Col lg={4} key={quiz.id} className="mb-4" style={{ paddingLeft: "8px", paddingRight: "8px" }}>
              <Card
                className="h-100 border-0 shadow-sm"
                style={{
                  borderRadius: "8px",
                  backgroundColor: "white",
                }}
              >
                <Card.Body style={{ padding: "20px" }}>
                  <h6
                    className="fw-semibold mb-3"
                    style={{
                      color: "#1a1a1a",
                      fontSize: "16px",
                      lineHeight: "1.4",
                      fontWeight: "600",
                      marginBottom: "12px",
                    }}
                  >
                    {quiz.title}
                  </h6>

                  <p
                    className="mb-3"
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginBottom: "16px",
                    }}
                  >
                    Quiz Type : {quiz.quiz_type =="macthing" ? "Maching Quiz" : quiz.quiz_type =="multi_component"?"Multi Component Quiz":"Multi Choic Quiz"} • {quiz.total_questions} Questions
                  </p>

                  <div className="d-flex justify-content-between align-items-center">
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                      }}
                    >
                      Last Edited : {quiz.updated_at.split("T")[0]} • {quiz.updated_at.split("T")[1].split(".")[0]}
                    </span>
                    <Badge
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        padding: "4px 12px",
                        borderRadius: "16px",
                        backgroundColor: quiz.status === "Published" ? "#3b82f6" : "#f59e0b",
                        color: "white",
                        border: "none",
                      }}
                    >
                      {quiz.status}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      </>
    
    )
}
export default Main