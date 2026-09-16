import { Bell } from "lucide-react"

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
      <div className="tp-home-coming-soon">
        <p className="tp-home-coming-soon-text">Coming Soon</p>
      </div>
    </section>
  )
}
