import React, { useState, useEffect } from "react";
import { Container, Row, Col, Dropdown, Table } from "react-bootstrap";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useParams } from "react-router";
import { base_url } from "../../../compugrade-constants";

const StudentDashboard = ({ classData, studentName }) => {
  const { studentId } = useParams();

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [lessonsFromAPI, setLessonsFromAPI] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [loadingProgress, setLoadingProgress] = useState({
    course: 0,
    average: 0,
  });

  const getProgressColor = (value) => {
    if (value < 50) return "#dc3545";
    if (value <= 70) return "#fd7e14";
    return "#28a745";
  };

  useEffect(() => {
    if (!selectedCourseId || !studentId) return;

    const fetchCourseData = async () => {
      const courseId = encodeURIComponent(selectedCourseId);
      try {
        const res = await fetch(
          `${base_url}/api/grading/get_course_progress_for_user?course_id=${courseId}&user_id=${studentId}`,
          {
            method: "POST",
          }
        );

        const result = await res.json();
        const { overall_progress, overall_score, subsections } = result.data;

        setLoadingProgress({
          course: overall_progress,
          average: overall_score,
        });

        const mappedLessons = subsections.length > 0  && subsections.map((sub) => ({
          section: sub.subsection_title,
          sectionKey: sub.subsection_id,
          targetProgress: sub.average_progress,
          items: sub.rubrics.map((rubric) => ({
            name: rubric.rubric_title,
            targetProgress: rubric.progress,
            lastAttempt: "--",
            grade: rubric.score > 0 ? `${rubric.score}%` : "--",
            dueDate: rubric.due_date
              ? new Date(rubric.due_date).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            letterGrade: rubric.score >= 50 ? "Pass" : "--",
          })),
        }));

        setLessonsFromAPI(mappedLessons);

        // initialize expanded state
        const newExpanded = {};
        mappedLessons.forEach((s) => {
          newExpanded[s.sectionKey] = true;
        });
        setExpandedSections(newExpanded);
      } catch (error) {
        console.error("Failed to fetch course data", error);
      }
    };

    fetchCourseData();
  }, [selectedCourseId, studentId]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const AnimatedCircularProgress = ({
    percentage,
    color,
    label,
    size = 100,
    strokeWidth = 8,
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset =
      circumference - (percentage / 100) * circumference;

    return (
      <div style={{ textAlign: "center", margin: "0 15px" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e9ecef"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 0.3s ease-out",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {Math.round(percentage)}%
          </div>
        </div>
        {label && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "11px",
              color: "#6c757d",
              fontWeight: "500",
            }}
          >
            {label}
          </div>
        )}
      </div>
    );
  };

  const handleSelectCourse = (course) => {
    setSelectedCourseId(course.id);
    setSelectedCourseName(course.display_name);
  };

  return (
    <div className="h-auto mb-4" style={{ borderRadius: "5px", border: "0.5px solid rgba(0, 0, 0, 0.30)", padding: "16px" }}>
      <Container fluid>
        <Row className="mb-3">
          <Col md={8}>
            <h4 className="primary-text">
              {classData?.name} {">"} {studentName} {">"} {selectedCourseName}
            </h4>
          </Col>
          <Col md={4} className="text-end">
            <div className="d-flex align-items-center justify-content-end">
              <span className="me-2" style={{ fontSize: "14px", fontWeight: "500", color: "#495057" }}>
                Select Course :
              </span>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm" style={{ minWidth: "100px", textAlign: "left", fontSize: "13px" }}>
                  {selectedCourseName || "Select Course"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {classData?.courses?.map((course) => (
                    <Dropdown.Item key={course.id} onClick={() => handleSelectCourse(course)}>
                      {course.display_name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>

        {selectedCourseName && (
          <>
            <Row className="mb-4 px-3 py-2" style={{ borderRadius: "2px", background: "#F1F1F1" }}>
              <Col md={7} className="mt-2">
                <h5 style={{ fontWeight: "600", marginBottom: "12px", fontSize: "15px", color: "#212529" }}>
                  Course Progress
                </h5>
                <h6 style={{ fontSize: "13px", color: "#495057", marginBottom: "16px" }}>
                  {studentName} has completed{" "}
                  <span style={{ color: getProgressColor(loadingProgress.course), fontWeight: "600" }}>
                    {loadingProgress.course}%{" "}
                  </span>{" "}
                  of the {selectedCourseName} with average grade{" "}
                  <span style={{ fontWeight: "600" }}>{loadingProgress.average}%</span>
                </h6>
                <button className="primary-button px-3 py-2">Send Message</button>
              </Col>
              <Col md={5}>
                <div className="d-flex justify-content-center align-items-center py-2">
                  <AnimatedCircularProgress
                    percentage={loadingProgress.course}
                    color={getProgressColor(loadingProgress.course)}
                    label="Course Progress"
                    size={110}
                    strokeWidth={10}
                  />
                  <AnimatedCircularProgress
                    percentage={loadingProgress.average}
                    color={getProgressColor(loadingProgress.average)}
                    label="Average Grade"
                    size={110}
                    strokeWidth={10}
                  />
                </div>
              </Col>
            </Row>

            <div style={{ border: "1px solid #dee2e6", borderRadius: "6px", overflow: "hidden" }}>
              <Table className="mb-0" style={{ fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th>Chapter Name</th>
                    <th className="text-center">Progress</th>
                    <th className="text-center">Last Attempt</th>
                    <th className="text-center">Grade(%)</th>
                    <th className="text-center">Due Date</th>
                    <th className="text-center">Letter Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {lessonsFromAPI?.map((section, sectionIndex) => (
                    <React.Fragment key={sectionIndex}>
                      <tr>
                        <td onClick={() => toggleSection(section.sectionKey)} style={{ cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}>
                          {expandedSections[section.sectionKey] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}{" "}
                          {section.section}
                        </td>
                        <td className="text-center">
                          <AnimatedCircularProgress
                            color={getProgressColor(section.targetProgress)}
                            percentage={section.targetProgress}
                            size={48}
                          />
                        </td>
                        <td className="text-center">--</td>
                        <td className="text-center">{section.targetProgress}%</td>
                        <td className="text-center"></td>
                        <td className="text-center">{section.targetProgress >= 50 ? "Pass" : "--"}</td>
                      </tr>

                      {expandedSections[section.sectionKey] &&
                        section.items.map((item, itemIndex) => (
                          <tr key={itemIndex}>
                            <td style={{ paddingLeft: "30px", textDecoration: "underline" }}>{item.name}</td>
                            <td className="text-center">
                              <AnimatedCircularProgress
                                color={getProgressColor(item.targetProgress)}
                                percentage={item.targetProgress}
                                size={48}
                              />
                            </td>
                            <td className="text-center">{item.lastAttempt}</td>
                            <td className="text-center">{item.grade}</td>
                            <td className="text-center" style={{ color: item.dueDate.includes("Oct 30") ? "#dc3545" : "#6c757d" }}>
                              {item.dueDate}
                            </td>
                            <td className="text-center" style={{ color: item.letterGrade === "Pass" ? "#28a745" : "#6c757d" }}>
                              {item.letterGrade}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}

                  <tr style={{ backgroundColor: "#255A71", color: "white" }}>
                    <td style={{ fontWeight: "600" }}>Course Average</td>
                    <td className="text-center">
                      <AnimatedCircularProgress
                        color={getProgressColor(loadingProgress.average)}
                        percentage={loadingProgress.average}
                        size={48}
                      />
                    </td>
                    <td></td>
                    <td className="text-center" style={{ fontWeight: "600" }}>
                      {loadingProgress.average}%
                    </td>
                    <td></td>
                    <td className="text-center" style={{ fontWeight: "600" }}>
                      {loadingProgress.average >= 50 ? "Pass" : "--"}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default StudentDashboard;
