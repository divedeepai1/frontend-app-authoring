import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"

export default function TableHeader() {
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
        <div className="d-flex align-items-center">
          <span style={labelMutedStyle}>Select Class :</span>
          <Form.Control
            as="select"
            size="md"
            style={selectStyle}
            defaultValue="Grade -3"
            aria-label="Select Class"
          >
            <option>Student Class Grade -1</option>
            <option>Student Class Grade -2</option>
            <option>Student Class Grade -3</option>
            <option>Student Class Grade -4</option>
            <option>Student Class Grade -5</option>
          </Form.Control>
        </div>
      </Col>
    </Row>
  )
}
