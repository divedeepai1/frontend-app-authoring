import { Card } from "react-bootstrap"
import { useNavigate } from "react-router";

export function ManagementCard({ title }) {
  const navigate = useNavigate();
  return (
    <Card style={{  borderWidth: "1px" }} className="text-center" onClick={() => title =="Manage Classes & Students" ? navigate("/classes") : title =="Manage Courses & Curriculum" ? navigate("/curriculum") : ""}>
      <Card.Body className="d-flex align-items-center justify-content-center" style={{ backgroundColor: "#F7F7F7",opacity:80 }}>
        <Card.Title className="fw-medium" style={{ color: "#255A71", fontSize:"18px" }}>
          {title}
        </Card.Title>
      </Card.Body>
    </Card>
  )
}
