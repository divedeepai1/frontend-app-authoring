import { Card } from "react-bootstrap"
import "./news-notice.css"

const NewsNotices = () => {
  const notices = [
    { id: 1, text: "New video content has been added in your purchased course", course: "LBD Microsoft Word Level 1" },
    { id: 2, text: "New video content has been added in your purchased course", course: "LBD Microsoft Word Level 1" },
    { id: 3, text: "New video content has been added in your purchased course", course: "LBD Microsoft Word Level 1" },
    { id: 4, text: "New video content has been added in your purchased course", course: "LBD Microsoft Word Level 1" },
    { id: 5, text: "New video content has been added in your purchased course", course: "LBD Microsoft Word Level 1" },
  ]

  return (
    <div className="news-notices-container">
      <div className="news-header">
        <h2>News/Notices</h2>
      </div>
      <div className="notices-list">
        {notices.map((notice) => (
          <Card key={notice.id} className="notice-card border-none">
            <Card.Body>
              <p>
                {notice.text}{" "}
                <a href="#" className="course-link">
                  {notice.course}
                </a>
              </p>
              <div className="update-link">
                <a href="#">See Update</a>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default NewsNotices
