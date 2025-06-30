

import { useState } from "react"
import { Container, Row, Col, Card, Table, Button, Dropdown, Collapse } from "react-bootstrap"
import "./student-dashboard.css"

const StudentDashboard = () => {
  const [openSections, setOpenSections] = useState({
    documentBasics: true,
    formattingText: true,
  })

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const CircularProgress = ({ percentage, color = "#28a745", size = 40 }) => {
    const radius = 16
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="circular-progress" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={radius} fill="none" stroke="#e6e6e6" strokeWidth="3" />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
          />
        </svg>
      </div>
    )
  }

  const LargeCircularProgress = ({ percentage, color, label, size = 80 }) => {
    return (
      <div className="large-progress-container">
        <div className="large-circular-progress" style={{ width: size, height: size }}>
          <CircularProgress percentage={percentage} color={color} size={size} />
          <div className="progress-text">
            <div className="progress-percentage">{percentage}%</div>
            <div className="progress-label">{label}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Container fluid className="student-dashboard">
      {/* Header */}
      <Row className="mb-3">
        <Col>
          <div className="breadcrumb-header">
            Class Name {">"} Students Name{">"} Course Name
          </div>
        </Col>
        <Col xs="auto">
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="course-dropdown">
              Select Course: LBD Microsoft 365 Word-1
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>LBD Microsoft 365 Word-1</Dropdown.Item>
              <Dropdown.Item>LBD Microsoft 365 Excel-1</Dropdown.Item>
              <Dropdown.Item>LBD Microsoft 365 PowerPoint-1</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      {/* Course Progress Card */}
      <Card className="progress-card mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6 className="progress-title">Course Progress</h6>
              <p className="progress-description">
                Ashley Jackson has completed <span className="highlight-red">15%</span> of the LBD Microsoft 365 Word-1
                with average grade <span className="highlight-green">70%</span>
              </p>
              <Button variant="primary" className="send-message-btn">
                Send Message
              </Button>
            </Col>
            <Col md={6}>
              <Row>
                <Col xs={6} className="text-center">
                  <LargeCircularProgress percentage={15} color="#dc3545" label="Course Progress" />
                </Col>
                <Col xs={6} className="text-center">
                  <LargeCircularProgress percentage={70} color="#28a745" label="Average Grade" />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Progress Table */}
      <Card>
        <Table className="progress-table mb-0">
          <thead className="table-header">
            <tr>
              <th>Chapter Name</th>
              <th>Progress</th>
              <th>Last Attempt</th>
              <th>Grade(%)</th>
              <th>Due Date</th>
              <th>Letter Grade</th>
            </tr>
          </thead>
          <tbody>
            {/* Document Basics Section */}
            <tr className="chapter-header clickable" onClick={() => toggleSection("documentBasics")}>
              <td>
                <span className={`arrow ${openSections.documentBasics ? "expanded" : ""}`}>▼</span>
                Document Basics
              </td>
              <td>
                <CircularProgress percentage={100} />
              </td>
              <td>
                Oct 8, 2024
                <br />
                11:14 AM
              </td>
              <td>70%</td>
              <td>—</td>
              <td>Pass</td>
            </tr>
            <Collapse in={openSections.documentBasics}>
              <tbody>
                <tr className="lesson-row">
                  <td className="lesson-indent">Lesson 1: Editing Basics</td>
                  <td>
                    <CircularProgress percentage={100} />
                  </td>
                  <td>
                    Oct 4, 2024
                    <br />
                    11:14 AM
                  </td>
                  <td>70%</td>
                  <td>—</td>
                  <td>Pass</td>
                </tr>
                <tr className="lesson-row">
                  <td className="lesson-indent">Lesson 2: Printing A Document</td>
                  <td>
                    <CircularProgress percentage={100} />
                  </td>
                  <td>
                    Oct 4, 2024
                    <br />
                    11:14 AM
                  </td>
                  <td>70%</td>
                  <td>—</td>
                  <td>Pass</td>
                </tr>
                <tr className="lesson-row">
                  <td className="lesson-indent">Lesson 3: Customising Quick Access Toolbar</td>
                  <td>
                    <CircularProgress percentage={100} />
                  </td>
                  <td>
                    Oct 4, 2024
                    <br />
                    11:14 AM
                  </td>
                  <td>70%</td>
                  <td>—</td>
                  <td>Pass</td>
                </tr>
              </tbody>
            </Collapse>

            {/* Formatting Text Section */}
            <tr className="chapter-header clickable" onClick={() => toggleSection("formattingText")}>
              <td>
                <span className={`arrow ${openSections.formattingText ? "expanded" : ""}`}>▼</span>
                Formatting Text
              </td>
              <td>
                <CircularProgress percentage={75} color="#ffc107" />
              </td>
              <td>
                Oct 8, 2024
                <br />
                11:14 AM
              </td>
              <td>70%</td>
              <td>—</td>
              <td>Pass</td>
            </tr>
            <Collapse in={openSections.formattingText}>
              <tbody>
                <tr className="lesson-row">
                  <td className="lesson-indent">Lesson 1: Top 10 Formulas</td>
                  <td>
                    <CircularProgress percentage={100} />
                  </td>
                  <td>
                    Oct 4, 2024
                    <br />
                    11:14 AM
                  </td>
                  <td>70%</td>
                  <td>—</td>
                  <td>Pass</td>
                </tr>
                <tr className="lesson-row">
                  <td className="lesson-indent">Lesson 2: Formatting Text with Effects</td>
                  <td>
                    <CircularProgress percentage={100} />
                  </td>
                  <td>
                    Oct 4, 2024
                    <br />
                    11:14 AM
                  </td>
                  <td>70%</td>
                  <td>—</td>
                  <td>Pass</td>
                </tr>
                <tr className="lesson-row">
                  <td className="lesson-indent">Lesson 3: Enhancing Proofreading Skills</td>
                  <td>
                    <CircularProgress percentage={25} color="#dc3545" />
                  </td>
                  <td>
                    Oct 4, 2024
                    <br />
                    11:14 AM
                  </td>
                  <td>—</td>
                  <td className="due-date-red">
                    Oct 30, 2024
                    <br />
                    12:00 AM
                  </td>
                  <td>—</td>
                </tr>
              </tbody>
            </Collapse>

            {/* Course Average */}
            <tr className="course-average-row">
              <td>
                <strong>Course Average</strong>
              </td>
              <td>
                <CircularProgress percentage={70} />
              </td>
              <td>—</td>
              <td>
                <strong>70%</strong>
              </td>
              <td>—</td>
              <td>
                <strong>Pass</strong>
              </td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </Container>
  )
}

export default StudentDashboard
