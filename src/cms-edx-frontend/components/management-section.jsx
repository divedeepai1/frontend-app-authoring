import { Container, Row, Col } from "react-bootstrap"
import { ManagementCard } from "./management-card"

export function ManagementSection() {
  return (
    <section className="py-4 px-5">
      <Container>
        <Row className="g-4">
          <Col md={4} lg={2}>
            <ManagementCard title="Manage Classes, Students, and Assign Courses" />
          </Col>
          <Col md={4} lg={2}>
            <ManagementCard title="Manage Courses & Set Preferences" />
          </Col>
          <Col md={4} lg={2}>
            <ManagementCard title="Gradebook" />
          </Col>
          <Col md={4} lg={2}>
            <ManagementCard title="Reports" />
          </Col>
          <Col md={4} lg={2}>
            <ManagementCard title="Teacher Materials" />
          </Col>
        </Row>
      </Container>
    </section>
  )
}
