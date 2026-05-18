import WelcomeBanner from "./components/WelcomeBanner"
import QuickAccessCards from "./components/QuickAccessCards"
import ActivityFeedPanel from "./components/ActivityFeedPanel"
import NewsNoticesPanel from "./components/NewsNoticesPanel"

export default function HomeApp() {
  return (
    <div className="tp-portal-page tp-home-page">
      <WelcomeBanner />
      <QuickAccessCards />
      <div className="tp-home-feed-row">
        <ActivityFeedPanel />
        <NewsNoticesPanel />
      </div>
    </div>
  )
}
