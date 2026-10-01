import { BarChart3 } from "lucide-react"

export default function ReportsComingSoon() {
  return (
    <section className="tp-reports-coming-soon" aria-label="Detailed reports">
      <BarChart3 className="tp-reports-coming-soon-icon" size={64} strokeWidth={1.5} aria-hidden />
      <h2 className="tp-reports-coming-soon-title">Detailed Reports Coming Soon</h2>
      <p className="tp-reports-coming-soon-text">
        Advanced analytics, student progress tracking, and comprehensive reporting features will be
        available here.
      </p>
    </section>
  )
}
