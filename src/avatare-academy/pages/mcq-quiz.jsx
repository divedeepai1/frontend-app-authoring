import { useState, useRef } from "react";
import { Container, Row, Col, Form, Card } from "react-bootstrap";
import HeaderTop from "../../header";
import Header from "./../components/header";
import { getConfig } from "@edx/frontend-platform";
import { fetchCsrfToken } from "../../cms-csrftoken";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

function McqForm() {
  const navigate = useNavigate();
  const [quizType, setQuizType] = useState("csv");
  const [csvFile, setCsvFile] = useState(null);
  const [csvError, setCsvError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false); // NEW
  const fileInputRef = useRef(null);

  const openFileDialog = () => fileInputRef.current?.click();
  const isCsv = (file) =>
    !!file && (/\.csv$/i.test(file.name) || file.type === "text/csv");

  const applyFile = (file) => {
    if (!file) return;
    if (!isCsv(file)) {
      setCsvFile(null);
      setCsvError("Please select a .csv file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setCsvError("");
    setCsvFile(file);
  };

  const onFileChange = (e) => applyFile(e.target.files?.[0]);

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    applyFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeFile = () => {
    setCsvFile(null);
    setCsvError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // start loading
    try {
      const token = await fetchCsrfToken();

      if (quizType === "multiple_choice") {
        navigate("/create-multi-quiz", { state: { quizType: "multiple_choice" } });
      } else if (quizType === "csv") {
        if (!csvFile) {
          setCsvError("Please select a CSV file before continuing.");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", csvFile);

        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/quizplugin/api/preview-mcq-csv/`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "X-CSRFToken": token,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to upload CSV: ${response.status} ${errorText}`);
        }

        const responseData = await response.json();
        navigate("/create-multi-quiz", {
          state: { quizType: "multiple_choice", data: responseData?.questions },
        });
      } else if (quizType === "chapter") {
        const response = await fetch(
          `${getConfig().STUDIO_BASE_URL}/quizplugin/api/generate-quiz/`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": token,
            },
            body: JSON.stringify({
              unit_id: sessionStorage.getItem("unit_id") || null,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to generate quiz: ${response.status} ${errorText}`);
        }

        const responseData = await response.json();
        navigate("/create-multi-quiz", {
          state: { quizType: "multiple_choice", data: responseData?.quiz?.questions },
        });
      }
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false); // stop loading always
    }
  };

  const handleCancel = () => navigate("/quiz-dashboard");

  return (
    <>
      <HeaderTop isHiddenMainMenu />
      <Header />
      <Container className="py-2">
        <Row>
          <Col lg={12} xl={12}>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Form.Label
                  className="fw-semibold mb-3"
                  style={{ color: "#333", fontSize: "0.95rem", fontWeight: 600 }}
                >
                  Select How do you want to add your Questions
                </Form.Label>

                <Row>
                  <Col md={4} className="mb-3">
                    <Card
                      className="h-80"
                      style={{
                        border:
                          quizType === "csv"
                            ? "2px solid #9AA6B2"
                            : "1px solid #dee2e6",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                      onClick={() => setQuizType("csv")}
                    >
                      <Card.Body
                        className="px-2 d-flex align-items-start"
                        style={{ gap: 6 }}
                      >
                        <Form.Check
                          type="radio"
                          name="quizType"
                          id="csv"
                          className="me-2 custom-radio"
                          checked={quizType === "csv"}
                          onChange={() => setQuizType("csv")}
                          style={{ pointerEvents: "none" }}
                        />
                        <div>
                          <div
                            className="fw-semibold"
                            style={{ fontSize: "0.9rem", color: "#333" }}
                          >
                            Import CSV File
                          </div>
                          <div className="text-muted" style={{ fontSize: "0.8rem" }}>
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
                          quizType === "multiple_choice"
                            ? "2px solid #9AA6B2"
                            : "1px solid #dee2e6",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                      onClick={() => setQuizType("multiple_choice")}
                    >
                      <Card.Body
                        className="px-2 d-flex align-items-start"
                        style={{ gap: 6 }}
                      >
                        <Form.Check
                          type="radio"
                          name="quizType"
                          id="multiple_choice"
                          className="me-2 custom-radio"
                          checked={quizType === "multiple_choice"}
                          onChange={() => setQuizType("multiple_choice")}
                          style={{ pointerEvents: "none" }}
                        />
                        <div>
                          <div
                            className="fw-semibold"
                            style={{ fontSize: "0.9rem", color: "#333" }}
                          >
                            Add Manual Questions
                          </div>
                          <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                            Add Manual MCQ questions
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
                          quizType === "chapter"
                            ? "2px solid #9AA6B2"
                            : "1px solid #dee2e6",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                      onClick={() => setQuizType("chapter")}
                    >
                      <Card.Body
                        className="px-2 d-flex align-items-start"
                        style={{ gap: 6 }}
                      >
                        <Form.Check
                          type="radio"
                          name="quizType"
                          id="chapter"
                          checked={quizType === "chapter"}
                          className="me-2 custom-radio"
                          onChange={() => setQuizType("chapter")}
                          style={{ pointerEvents: "none" }}
                        />
                        <div>
                          <div
                            className="fw-semibold"
                            style={{ fontSize: "0.9rem", color: "#333" }}
                          >
                            Generate Questions from Chapter
                          </div>
                          <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                            Auto Generate questions using AI
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>

              {quizType === "csv" && (
                <div className="mb-4">
                  <Form.Label
                    className="fw-semibold mb-3"
                    style={{ color: "#333", fontSize: "0.95rem", fontWeight: 600 }}
                  >
                    Import CSV File
                  </Form.Label>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={openFileDialog}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openFileDialog();
                    }}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    style={{
                      border: `2px dashed ${isDragging ? "#27AAE1" : "#ccc"}`,
                      borderRadius: 8,
                      padding: 30,
                      textAlign: "center",
                      background: "#fafafa",
                      outline: "none",
                      transition: "border-color 120ms ease-in-out",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "1rem", fontWeight: 500, marginBottom: 6 }}>
                      Upload CSV File
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                      Drag and drop your CSV file here, or click to browse
                    </div>
                  </div>

                  <Form.Control
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={onFileChange}
                    className="d-none"
                  />

                  {csvError && (
                    <div className="text-danger mt-2" style={{ fontSize: "0.9rem" }}>
                      {csvError}
                    </div>
                  )}

                  {csvFile && (
                    <div
                      className="d-flex align-items-center justify-content-between mt-3"
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: "10px 12px",
                        background: "#fff",
                      }}
                    >
                      <div
                        className="text-truncate"
                        style={{ maxWidth: "85%", fontSize: "0.95rem" }}
                        title={csvFile.name}
                      >
                        {csvFile.name}
                      </div>
                      <span onClick={removeFile} style={{ cursor: "pointer" }}>
                        <X size={20} />
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex gap-3 pt-3 mb-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="primary-button px-3 d-flex align-items-center justify-content-center"
                  style={{
                    padding: "10px 24px",
                    height: "40px",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    borderRadius: 6,
                    marginLeft: 10,
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2 mr-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    "Continue and Proceed"
                  )}
                </button>
              </div>
            </form>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default McqForm;
