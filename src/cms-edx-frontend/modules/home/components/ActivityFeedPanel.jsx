import { Activity } from "lucide-react"

export default function ActivityFeedPanel() {
  return (
    <section className="tp-home-feed-panel" aria-labelledby="tp-home-activity-title">
      <div className="tp-home-feed-header">
        <div className="tp-home-feed-title-row">
          <Activity className="tp-home-feed-title-icon" size={22} aria-hidden />
          <h2 id="tp-home-activity-title" className="tp-home-feed-title">
            Activity Feed
          </h2>
        </div>
      </div>
      <div className="tp-home-coming-soon">
        <p className="tp-home-coming-soon-text">Coming Soon</p>
      </div>
    </section>
  )
}
