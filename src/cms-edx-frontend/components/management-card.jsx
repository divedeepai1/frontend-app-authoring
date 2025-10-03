import { Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router";

export function ManagementCard({ title }) {
  const navigate = useNavigate();
  const location = useLocation();

  const routeMap = {
    "Manage Classes & Students": "/classes",
    "Manage Courses & Curriculum": "/curriculum",
    "Reports": "/reports",
    "Additional Resources": "/resources", 
  };

  const route = routeMap[title];
  const isActive = location.pathname.startsWith(route);

  return (
    <Card
      style={{
        borderWidth: "1px",
        borderBottom: isActive ? "3px solid #255A71" : "1px solid #dee2e6", 
        cursor: "pointer",
        overflow:"hidden"
      }}
      className="text-center"
      onClick={() => navigate(route)}
    >
      <Card.Body
        className="d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#F7F7F7", opacity: 0.8 }}
      >
        <Card.Title
          className="fw-medium"
          style={{ color: "#255A71", fontSize: "18px" }}
        >
          {title}
        </Card.Title>
      </Card.Body>
    </Card>
  );
}
