import { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";

import HeaderTop from "../../header";
import Header from "./../components/header";
import { getConfig } from "@edx/frontend-platform";
import { useEffect } from "react";
import { fetchCsrfToken } from "../../cms-csrftoken";
import { useNavigate } from "react-router-dom";

function QuizForm() {
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizType, setQuizType] = useState("multi_component");
  const [quizInstructions, setQuizInstructions] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Always prevent default at the start
    const form = e.currentTarget;
  
    if (!form.checkValidity()) {
      e.stopPropagation(); // Optional: prevent further event bubbling
      return;
    }
  
    const token = await fetchCsrfToken();
  
    const data = JSON.stringify({
      title: quizTitle,
      description: quizDescription,
      quiz_type: quizType,
      instructions: quizInstructions,
      category_id: 1,
      course_key: "",
    });
  
    try {
      const response = await fetch(
        `${getConfig().STUDIO_BASE_URL}/quizplugin/api/quizzes/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
          body: data,
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add quiz: ${response.status} ${errorText}`);
      }
      const responseData = await response.json();
      sessionStorage.setItem("quizId", responseData.id);
      navigate("/create-multi-quiz");
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  
  const handleCancel = () => {
    navigate("/home");
  };

  return (
    <>
      <HeaderTop isHiddenMainMenu />
      <Header />
      <Container className="py-2">
        <Row className="">
          <Col lg={12} xl={12}>
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="mb-4">
                <Form.Label
                  className="fw-semibold mb-2"
                  style={{
                    color: "#333",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                  }}
                >
                  Quiz Title
                </Form.Label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Enter Quiz Title"
                  value={quizTitle}
                  required
                  onChange={(e) => setQuizTitle(e.target.value)}
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    padding: "12px 16px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              <div className="mb-4">
                <Form.Label
                  className="fw-semibold mb-2"
                  style={{
                    color: "#333",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                  }}
                >
                  Quiz Description
                </Form.Label>
                <textarea
                  as="textarea"
                  className="form-control"
                  rows={4}
                  placeholder="Enter Quiz Description"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    padding: "12px 16px",
                    fontSize: "0.95rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <div className="mb-4">
                <Form.Label
                  className="fw-semibold mb-3"
                  style={{
                    color: "#333",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                  }}
                >
                  Quiz Type
                </Form.Label>
                <Row>
                  <Col md={4} className="mb-3">
                    <Card
                      className="h-80"
                      style={{
                        border:
                          quizType === "multiple-choice"
                            ? "2px solid #9AA6B2"
                            : "1px solid #dee2e6",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                      // onClick={() => setQuizType("multiple_choice")}
                    >
                      <Card.Body
                        className="px-2 d-flex align-items-start"
                        style={{ gap: "6px" }}
                      >
                        <Form.Check
                          type="radio"
                          name="quizType"
                          id="multiple-choice"
                          className="me-2 custom-radio"
                          checked={quizType === "multiple_choice"}
                          // onChange={() => setQuizType("multiple_choice")}
                          style={{ pointerEvents: "none" }}
                        />
                        <div>
                          <div
                            className="fw-semibold"
                            style={{
                              fontSize: "0.9rem",
                              color: "#333",
                              fontWeight: "600",
                            }}
                          >
                            Multiple Choice Questions
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            Standard Multiple Choice Questions Only
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4} className="mb-3">
                    <Card
                      className="h-80"
                      style={{
                        border:
                          quizType === "multi-component"
                            ? "2px solid #9AA6B2"
                            : "1px solid #dee2e6",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                      onClick={() => setQuizType("multi_component")}
                    >
                      <Card.Body
                        className="px-2 d-flex align-items-start"
                        style={{ gap: "6px" }}
                      >
                        <Form.Check
                          type="radio"
                          name="quizType"
                          id="multi-component"
                          className="me-2 custom-radio"
                          checked={quizType === "multi_component"}
                          onChange={() => setQuizType("multi_component")}
                          style={{ pointerEvents: "none" }}
                        />
                        <div>
                          <div
                            className="fw-semibold"
                            style={{
                              fontSize: "0.9rem",
                              color: "#333",
                              fontWeight: "600",
                            }}
                          >
                            Multi-Component Quiz
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            Mix of Different Questions Type
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4} className="mb-3">
                    <Card
                      className="h-80"
                      style={{
                        border:
                          quizType === "matching"
                            ? "2px solid #9AA6B2"
                            : "1px solid #dee2e6",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                      // onClick={() => setQuizType("matching")}
                    >
                      <Card.Body
                        className="px-2 d-flex align-items-start"
                        style={{ gap: "6px" }}
                      >
                        <Form.Check
                          type="radio"
                          name="quizType"
                          id="matching"
                          checked={quizType === "matching"}
                          className="me-2 custom-radio"
                          // onChange={() => setQuizType("matching")}
                          style={{ pointerEvents: "none" }}
                        />
                        <div>
                          <div
                            className="fw-semibold"
                            style={{
                              fontSize: "0.9rem",
                              color: "#333",
                              fontWeight: "600",
                            }}
                          >
                            Matching Quiz
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            Match Items from Two Columns
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>

              <div className="mb-4">
                <Form.Label
                  className="fw-semibold mb-2"
                  style={{
                    color: "#333",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                  }}
                >
                  Quiz Instructions
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter Quiz Instructions"
                  value={quizInstructions}
                  onChange={(e) => setQuizInstructions(e.target.value)}
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    padding: "12px 16px",
                    fontSize: "0.95rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <div className="d-flex gap-3 pt-3 mb-4">
                <Button
                  variant="outline-secondary"
                  onClick={handleCancel}
                  style={{
                    padding: "10px 24px",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    borderRadius: "6px",
                  }}
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  className="primary-button px-3"
                  style={{
                    padding: "10px 24px",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    borderRadius: "6px",
                    marginLeft: "10px",
                  }}
                >
                  Continue to Add Questions
                </button>
              </div>
            </form>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default QuizForm;
