
import React, { useState, useEffect } from "react"
import { Container, Row, Col, Button, Dropdown, Table } from "react-bootstrap"


const StudentDashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState("LBD Microsoft 365 Word-1")
  const [expandedSections, setExpandedSections] = useState({
    documentBasics: true,
    formattingText: true,
  })
  const [loadingProgress, setLoadingProgress] = useState({
    course: 0,
    average: 0,
    tableItems: {},
  })

  // Animate progress circles on mount
  useEffect(() => {
    const animateProgress = () => {
      let courseProgress = 0
      let averageProgress = 0
      const tableItemsProgress = {}

      const interval = setInterval(() => {
        if (courseProgress < 15) {
          courseProgress += 1
        }
        if (averageProgress < 70) {
          averageProgress += 2
        }

        // Animate table item progress
        const itemTargets = {
          "document-basics-section": 100,
          "formatting-text-section": 67,
          "lesson-1-editing": 100,
          "lesson-2-printing": 100,
          "lesson-3-toolbar": 100,
          "lesson-1-formulas": 100,
          "lesson-2-formatting": 100,
          "lesson-3-proofreading": 25,
          "course-average": 70,
        }

        Object.keys(itemTargets).forEach((key) => {
          if (!tableItemsProgress[key]) tableItemsProgress[key] = 0
          if (tableItemsProgress[key] < itemTargets[key]) {
            tableItemsProgress[key] += Math.ceil(itemTargets[key] / 50)
            if (tableItemsProgress[key] > itemTargets[key]) {
              tableItemsProgress[key] = itemTargets[key]
            }
          }
        })

        setLoadingProgress({
          course: courseProgress,
          average: averageProgress,
          tableItems: { ...tableItemsProgress },
        })

        const allComplete =
          courseProgress >= 15 &&
          averageProgress >= 70 &&
          Object.keys(itemTargets).every((key) => tableItemsProgress[key] >= itemTargets[key])

        if (allComplete) {
          clearInterval(interval)
        }
      }, 80)

      return () => clearInterval(interval)
    }

    const timer = setTimeout(animateProgress, 500)
    return () => clearTimeout(timer)
  }, [])

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const AnimatedCircularProgress = ({ percentage, color, label, size = 100, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div style={{ textAlign: "center", margin: "0 15px" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e9ecef"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle with animation */}
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
            {/* Loading shimmer effect */}
            {percentage < (label === "Course Progress" ? 15 : 70) && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray="10 5"
                style={{
                  animation: "rotate 2s linear infinite",
                }}
              />
            )}
          </svg>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            {Math.round(percentage)}%
          </div>
        </div>
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
        <style jsx>{`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Dynamic Small SVG Progress Circle for table rows
  const SmallProgressCircle = ({ itemKey, targetPercentage, size = 24, showPercentage = false }) => {
    const currentPercentage = loadingProgress.tableItems[itemKey] || 0
    const radius = 8
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (currentPercentage / 100) * circumference

    // Determine color based on percentage
    let color = "#dc3545" // red for low progress
    if (currentPercentage >= 80) {
      color = "#28a745" // green for high progress
    } else if (currentPercentage >= 50) {
      color = "#ffc107" // orange for medium progress
    }

    // Special color for course average (white on blue background)
    const isAverage = itemKey === "course-average"
    if (isAverage) {
      color = "white"
    }

    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isAverage ? "rgba(255,255,255,0.3)" : "#e9ecef"}
            strokeWidth="3"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.5s ease-out",
              filter: isAverage ? "none" : "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
            }}
          />
          {/* Loading shimmer effect for incomplete items */}
          {currentPercentage < targetPercentage && !isAverage && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
              fill="transparent"
              strokeDasharray="8 4"
              style={{
                animation: "rotate 3s linear infinite",
              }}
            />
          )}
          {/* Center indicator based on completion */}
          {currentPercentage >= 95 && (
            <g transform={`translate(${size / 2}, ${size / 2}) rotate(90)`}>
              <circle r="2.5" fill={isAverage ? "white" : color} />
            </g>
          )}
          {currentPercentage < 30 && currentPercentage > 0 && !isAverage && (
            <g transform={`translate(${size / 2}, ${size / 2}) rotate(90)`}>
              <line x1="-3" y1="-3" x2="3" y2="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="-3" x2="-3" y2="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}
        </svg>
        {/* Percentage text overlay for debugging/info */}
        {showPercentage && (
          <div
            style={{
              position: "absolute",
              fontSize: "8px",
              fontWeight: "bold",
              color: "#666",
              top: "-15px",
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            {Math.round(currentPercentage)}%
          </div>
        )}
        <style jsx>{`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const lessons = [
    {
      section: "Document Basics",
      sectionKey: "documentBasics",
      progressKey: "document-basics-section",
      targetProgress: 100,
      items: [
        {
          name: "Lesson 1 : Editing Basics",
          progressKey: "lesson-1-editing",
          targetProgress: 100,
          lastAttempt: "Oct 8, 2024\n11:14 AM",
          grade: "70%",
          dueDate: "",
          letterGrade: "Pass",
        },
        {
          name: "Lesson 2 : Printing A Document",
          progressKey: "lesson-2-printing",
          targetProgress: 100,
          lastAttempt: "Oct 4, 2024\n11:14 AM",
          grade: "70%",
          dueDate: "",
          letterGrade: "Pass",
        },
        {
          name: "Lesson 3 : Customising Quick Access Toolbar",
          progressKey: "lesson-3-toolbar",
          targetProgress: 100,
          lastAttempt: "Oct 4, 2024\n11:14 AM",
          grade: "70%",
          dueDate: "",
          letterGrade: "Pass",
        },
      ],
    },
    {
      section: "Formatting Text",
      sectionKey: "formattingText",
      progressKey: "formatting-text-section",
      targetProgress: 67,
      items: [
        {
          name: "Lesson 1 : Top 10 Formulas",
          progressKey: "lesson-1-formulas",
          targetProgress: 100,
          lastAttempt: "Oct 4, 2024\n11:14 AM",
          grade: "70%",
          dueDate: "",
          letterGrade: "Pass",
        },
        {
          name: "Lesson 2 : Formatting Text with Effects",
          progressKey: "lesson-2-formatting",
          targetProgress: 100,
          lastAttempt: "Oct 4, 2024\n11:14 AM",
          grade: "70%",
          dueDate: "",
          letterGrade: "Pass",
        },
        {
          name: "Lesson 3 : Enhancing Proofreading Skills",
          progressKey: "lesson-3-proofreading",
          targetProgress: 25,
          lastAttempt: "Oct 4, 2024\n11:14 AM",
          grade: "--",
          dueDate: "Oct 30, 2024\n12:00 AM",
          letterGrade: "--",
        },
      ],
    },
  ]

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <Container fluid>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #e9ecef",
          }}
        >
          {/* Header */}
          <Row className="mb-3">
            <Col md={8}>
              <div
                style={{
                  fontSize: "14px",
                  color: "#495057",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Class Name {">"} Students Name{">"} Course Name
              </div>
            </Col>
            <Col md={4} className="text-end">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <span
                  style={{
                    marginRight: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#495057",
                  }}
                >
                  Select Course :
                </span>
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    size="sm"
                    style={{
                      minWidth: "220px",
                      textAlign: "left",
                      fontSize: "13px",
                      border: "1px solid #ced4da",
                      backgroundColor: "white",
                    }}
                  >
                    {selectedCourse}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSelectedCourse("LBD Microsoft 365 Word-1")}>
                      LBD Microsoft 365 Word-1
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
          </Row>

          {/* Course Progress Section */}
          <Row className="mb-4">
            <Col md={7}>
              <h6
                style={{
                  fontWeight: "600",
                  marginBottom: "12px",
                  fontSize: "15px",
                  color: "#212529",
                }}
              >
                Course Progress
              </h6>
              <p
                style={{
                  fontSize: "13px",
                  color: "#495057",
                  marginBottom: "16px",
                  lineHeight: "1.4",
                }}
              >
                Ashley Jackson has completed <span style={{ color: "#dc3545", fontWeight: "600" }}>15 %</span> of the
                LBD Microsoft 365 Word-1 with average grade <span style={{ fontWeight: "600" }}>70%</span>
              </p>
              <Button
                style={{
                  backgroundColor: "#17a2b8",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "13px",
                  padding: "8px 20px",
                  fontWeight: "500",
                  boxShadow: "0 2px 4px rgba(23,162,184,0.2)",
                }}
              >
                Send Message
              </Button>
            </Col>
            <Col md={5}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "10px 0",
                }}
              >
                <AnimatedCircularProgress
                  percentage={loadingProgress.course}
                  color="#dc3545"
                  label="Course Progress"
                  size={110}
                  strokeWidth={10}
                />
                <AnimatedCircularProgress
                  percentage={loadingProgress.average}
                  color="#28a745"
                  label="Average Grade"
                  size={110}
                  strokeWidth={10}
                />
              </div>
            </Col>
          </Row>

          {/* Table */}
          <div
            style={{
              border: "1px solid #dee2e6",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <Table className="mb-0" style={{ fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      padding: "14px 16px",
                      fontWeight: "600",
                      borderBottom: "1px solid #dee2e6",
                      color: "#495057",
                      fontSize: "13px",
                    }}
                  >
                    Chapter Name
                  </th>
                  <th
                    style={{
                      padding: "14px 16px",
                      fontWeight: "600",
                      borderBottom: "1px solid #dee2e6",
                      textAlign: "center",
                      color: "#495057",
                      fontSize: "13px",
                    }}
                  >
                    Progress
                  </th>
                  <th
                    style={{
                      padding: "14px 16px",
                      fontWeight: "600",
                      borderBottom: "1px solid #dee2e6",
                      textAlign: "center",
                      color: "#495057",
                      fontSize: "13px",
                    }}
                  >
                    Last Attempt
                  </th>
                  <th
                    style={{
                      padding: "14px 16px",
                      fontWeight: "600",
                      borderBottom: "1px solid #dee2e6",
                      textAlign: "center",
                      color: "#495057",
                      fontSize: "13px",
                    }}
                  >
                    Grade(%)
                  </th>
                  <th
                    style={{
                      padding: "14px 16px",
                      fontWeight: "600",
                      borderBottom: "1px solid #dee2e6",
                      textAlign: "center",
                      color: "#495057",
                      fontSize: "13px",
                    }}
                  >
                    Due Date
                  </th>
                  <th
                    style={{
                      padding: "14px 16px",
                      fontWeight: "600",
                      borderBottom: "1px solid #dee2e6",
                      textAlign: "center",
                      color: "#495057",
                      fontSize: "13px",
                    }}
                  >
                    Letter Grade
                  </th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((section, sectionIndex) => (
                  <React.Fragment key={sectionIndex}>
                    {/* Section Header */}
                    <tr style={{ backgroundColor: "#ffffff" }}>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontWeight: "600",
                          cursor: "pointer",
                          borderBottom: "1px solid #dee2e6",
                          color: "#212529",
                          textDecoration: "underline",
                        }}
                        onClick={() => toggleSection(section.sectionKey)}
                      >
                        <span
                          style={{
                            marginRight: "8px",
                            fontSize: "12px",
                            color: "#6c757d",
                          }}
                        >
                          {expandedSections[section.sectionKey] ? "▼" : "▶"}
                        </span>
                        {section.section}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          textAlign: "center",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        <SmallProgressCircle itemKey={section.progressKey} targetPercentage={section.targetProgress} />
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          textAlign: "center",
                          borderBottom: "1px solid #dee2e6",
                          fontSize: "12px",
                          color: "#6c757d",
                        }}
                      >
                        Oct 8, 2024
                        <br />
                        11:14 AM
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          textAlign: "center",
                          borderBottom: "1px solid #dee2e6",
                          fontWeight: "500",
                        }}
                      >
                        70%
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          textAlign: "center",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      ></td>
                      <td
                        style={{
                          padding: "14px 16px",
                          textAlign: "center",
                          borderBottom: "1px solid #dee2e6",
                          color: "#28a745",
                          fontWeight: "500",
                        }}
                      >
                        Pass
                      </td>
                    </tr>

                    {/* Section Items */}
                    {expandedSections[section.sectionKey] &&
                      section.items.map((item, itemIndex) => (
                        <tr key={itemIndex} style={{ backgroundColor: "#fafbfc" }}>
                          <td
                            style={{
                              padding: "12px 16px",
                              paddingLeft: "48px",
                              borderBottom: "1px solid #dee2e6",
                              color: "#495057",
                              fontSize: "13px",
                            }}
                          >
                            {item.name}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            <SmallProgressCircle itemKey={item.progressKey} targetPercentage={item.targetProgress} />
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                              borderBottom: "1px solid #dee2e6",
                              whiteSpace: "pre-line",
                              fontSize: "12px",
                              color: "#6c757d",
                            }}
                          >
                            {item.lastAttempt}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                              borderBottom: "1px solid #dee2e6",
                              fontWeight: "500",
                            }}
                          >
                            {item.grade}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                              borderBottom: "1px solid #dee2e6",
                              whiteSpace: "pre-line",
                              fontSize: "12px",
                              color: item.dueDate.includes("Oct 30") ? "#dc3545" : "#6c757d",
                              fontWeight: item.dueDate.includes("Oct 30") ? "500" : "normal",
                            }}
                          >
                            {item.dueDate}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              textAlign: "center",
                              borderBottom: "1px solid #dee2e6",
                              color: item.letterGrade === "Pass" ? "#28a745" : "#6c757d",
                              fontWeight: "500",
                            }}
                          >
                            {item.letterGrade}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}

                {/* Course Average Row */}
                <tr style={{ backgroundColor: "#17a2b8", color: "white" }}>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Course Average
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <SmallProgressCircle itemKey="course-average" targetPercentage={70} />
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}></td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    70%
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}></td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Pass
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default StudentDashboard
