import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"

export default function TableHeader({ 
  classes = [], 
  courses = [], 
  selectedClassId = "", 
  selectedCourseId = "", 
  onClassChange = () => {}, 
  onCourseChange = () => {} 
}) {
  const titleStyle = {
    fontSize: "1rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".02em",
    color: "#111827",
    margin: 0,
  }

  const labelMutedStyle = {
    fontSize: "1.2rem",
    color: "black",
    marginRight: 8,
  }

  const selectStyle = {
    boxShadow: "none",
    outline: "none",
    borderColor: "#D1D5DB",
    color: "#111827",
    height: 36,
    padding: "0 28px 0 8px",
    lineHeight: 1.5,
  }

  return (
    <Row className="align-items-center p-4">
      <Col xs="auto">
        <h5 className="primary-text text-xl">Additional Resources</h5>
      </Col>
      <Col className="ms-auto" xs="auto">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center">
            <span style={labelMutedStyle}>Select Class:</span>
            <Form.Control
              as="select"
              size="md"
              style={selectStyle}
              value={selectedClassId}
              onChange={(e) => onClassChange(e.target.value)}
              aria-label="Select Class"
            >
              <option value="">All Classes</option>
              {classes && classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </Form.Control>
          </div>
          <div className="d-flex align-items-center">
            <span style={labelMutedStyle}>Select Course:</span>
            <Form.Control
              as="select"
              size="md"
              style={selectStyle}
              value={selectedCourseId}
              onChange={(e) => onCourseChange(e.target.value)}
              aria-label="Select Course"
            >
              <option value="">All Courses</option>
              {courses && courses.map(crs => (
                <option key={crs.id} value={crs.id}>{crs.display_name}</option>
              ))}
            </Form.Control>
          </div>
        </div>
      </Col>
    </Row>
  )
}
