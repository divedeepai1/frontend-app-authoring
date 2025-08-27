import Header from "./../components/header";
import HeaderTop from "../../header";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { fetchCsrfToken } from "../../cms-csrftoken";
import { getConfig } from "@edx/frontend-platform";
import { useNavigate } from "react-router";

const Main = () => {
  const navigate= useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [refresh,setRefresh]=useState(false);

  useEffect(() => {
    const PostCategory = async () => {
      const token = await fetchCsrfToken();

      try {
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/quizplugin/api/dashboard/`,
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
          throw new Error(`Failed to fetch dashboard: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        setDashboardData(result);
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    PostCategory();
  }, [refresh]);

  const handleDeleteQuiz = async (quizId) => {
    const token = await fetchCsrfToken();
    const confirmed = window.confirm("Are you sure you want to delete this quiz?");
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/quizplugin/api/quizzes/${quizId}/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete quiz: ${response.status} ${errorText}`);
      }

      setDashboardData((prevData) => ({
        ...prevData,
        recent_quizzes: prevData.recent_quizzes.filter((quiz) => quiz.id !== quizId),
      }));
      setRefresh(!refresh)
    } catch (error) {
      console.error("Error deleting quiz:", error.message);
    }
  };

  const handleEdit = (quiz) =>{
    navigate("/create-multi-quiz", { state: { quizType : quiz?.quiz_type ,quizId:quiz?.id , status :quiz.status === "published" || false } });
  }

  return (
    <>
      <HeaderTop isHiddenMainMenu />
      <Header button={true} />
      <Container>
        <Row className="mb-4">
          <Col lg={4} className="pe-2">
            <Card className="border-0 shadow-sm" style={{ borderRadius: "8px", backgroundColor: "white" }}>
              <Card.Body style={{ padding: "24px" }}>
                <h6 className="fw-semibold mb-1" style={{ fontSize: "16px", color: "#1a1a1a" }}>
                  Total Quizzes
                </h6>
                <p className="mb-3" style={{ fontSize: "14px", color: "#6b7280" }}>
                  All created quizzes
                </p>
                <h1 className="fw-bold mb-0" style={{ fontSize: "48px", color: "#1a1a1a" }}>
                  {dashboardData?.total_quizzes}
                </h1>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="px-2">
            <Card className="border-0 shadow-sm" style={{ borderRadius: "8px", backgroundColor: "white" }}>
              <Card.Body style={{ padding: "24px" }}>
                <h6 className="fw-semibold mb-1" style={{ fontSize: "16px", color: "#1a1a1a" }}>
                  Published Quizzes
                </h6>
                <p className="mb-3" style={{ fontSize: "14px", color: "#6b7280" }}>
                  Quizzes available to students
                </p>
                <h1 className="fw-bold mb-0" style={{ fontSize: "48px", color: "#1a1a1a" }}>
                  {dashboardData?.published_quizzes}
                </h1>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="ps-2">
            <Card className="border-0 shadow-sm" style={{ borderRadius: "8px", backgroundColor: "white" }}>
              <Card.Body style={{ padding: "24px" }}>
                <h6 className="fw-semibold mb-1" style={{ fontSize: "16px", color: "#1a1a1a" }}>
                  Draft Quizzes
                </h6>
                <p className="mb-3" style={{ fontSize: "14px", color: "#6b7280" }}>
                  Quizzes in progress
                </p>
                <h1 className="fw-bold mb-0" style={{ fontSize: "48px", color: "#1a1a1a" }}>
                  {dashboardData?.draft_quizzes}
                </h1>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Quizzes Section */}
        {dashboardData?.recent_quizzes?.length > 0 && <div className="mb-4" style={{ marginTop: "40px" }}>
          <h4 className="fw-bold" style={{ fontSize: "20px", color: "#1a1a1a" }}>
            Recent Quizzes
          </h4>
        </div>}

        <Row>
          {dashboardData?.recent_quizzes?.length > 0 ? dashboardData?.recent_quizzes?.map((quiz) => (
            <Col lg={4} key={quiz.id} className="mb-4 px-2">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "8px", backgroundColor: "white" }}>

                <Card.Body style={{ padding: "20px", position: "relative" }}>
                <Edit
                    size={18}
                    
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "42px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleEdit(quiz)}
                  />
                  <Trash2
                    size={18}
                    
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleDeleteQuiz(quiz.id)}
                  />

                  <h6 className="fw-semibold mb-3" style={{ fontSize: "16px", color: "#1a1a1a" }}>
                    {quiz.title}
                  </h6>

                  <p className="mb-3" style={{ fontSize: "14px", color: "#6b7280" }}>
                    Quiz Type :{" "}
                    {quiz.quiz_type === "matching"
                      ? "Matching Quiz"
                      : quiz.quiz_type === "multi_component"
                      ? "Multi Component Quiz"
                      : "Multiple Choice Quiz"}{" "}
                    • {quiz.total_questions} Questions
                  </p>

                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>
                      Last Edited : {quiz.updated_at.split("T")[0]} •{" "}
                      {quiz.updated_at.split("T")[1].split(".")[0]}
                    </span>
                    <Badge
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        padding: "4px 12px",
                        borderRadius: "16px",
                        backgroundColor: quiz.status === "published" ? "#3b82f6" : "#f59e0b",
                        color: "white",
                      }}
                    >
                      {quiz.status}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )):

          <h4 className="d-flex justify-content-center mt-4" style={{width:"100%"}}>No Quizzes found!</h4>
        }
        </Row>
      </Container>
    </>
  );
};

export default Main;
