import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"

export default function TableHeader({ 
  classes = [], 
  courses = [], 
  selectedClassId = "", 
  selectedCourseId = "", 
  onClassChange = () => {}, 
  onCourseChange = () => {},
  onAddResource = () => {}
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
    borderColor: "#6B7280",
    border: "1px solid #6B7280",
    color: "#111827",
    height: 36,
    padding: "0 40px 0 8px",
    lineHeight: 1.5,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "14px",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  }

  return (
    <>
      <style>{`
        select:focus,
        select:active,
        .form-control:focus,
        .form-control:active {
          box-shadow: none !important;
          outline: none !important;
        }
      `}</style>
      <Row className="align-items-center p-4">
      <Col xs="auto">
        <h5 className="primary-text text-xl m-0">Additional Resources</h5>
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
              {Array.isArray(classes) && classes.length > 0 ? (
                <>
                  <option value="">All Resources</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </>
              ) : (
                <option value="">No relevant class</option>
              )}
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
              {Array.isArray(courses) && courses.length > 0 ? (
                <>
                  <option value="">All Courses</option>
                  {courses.map(crs => (
                    <option key={crs.id} value={crs.id}>{crs.display_name}</option>
                  ))}
                </>
              ) : (
                <option value="">No courses</option>
              )}
            </Form.Control>
          </div>
          <button 
            className="primary-button px-4 py-2"
            onClick={onAddResource}
          >
            Add Resources
          </button>
        </div>
      </Col>
    </Row>
    </>
  )
}
