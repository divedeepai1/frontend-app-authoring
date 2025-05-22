import { Container, Row, Col } from "react-bootstrap"
import { ManagementCard } from "./management-card"

export function ManagementSection() {
  return (
    <section className="py-5 px-5">
      <Container>
        <Row className="g-4">
          <Col md={3}>
            <ManagementCard title="Manage Classes & Students" />
          </Col>
          <Col md={3}>
            <ManagementCard  title="Manage Courses & Curriculum" />
          </Col>
          <Col md={3}>
            <ManagementCard title="Reports" />
          </Col>
          <Col md={3}>
            <ManagementCard title="Additional Resources" />
          </Col>
        </Row>
      </Container>
    </section>
  )
}
