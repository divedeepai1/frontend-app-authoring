import { Bell } from "lucide-react"
import { MOCK_NEWS_NOTICES } from "../data/mockHomeData"

export default function NewsNoticesPanel() {
  return (
    <section className="tp-home-feed-panel tp-home-news-panel" aria-labelledby="tp-home-news-title">
      <div className="tp-home-feed-header">
        <div className="tp-home-feed-title-row">
          <Bell className="tp-home-feed-title-icon" size={22} aria-hidden />
          <h2 id="tp-home-news-title" className="tp-home-feed-title">
            News &amp; Notices
          </h2>
        </div>
      </div>
      <ul className="tp-home-news-list">
        {MOCK_NEWS_NOTICES.map((notice) => (
          <li key={notice.id} className="tp-home-news-item">
            <p className="tp-home-news-text">{notice.text}</p>
            <p className="tp-home-news-course">{notice.course}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
