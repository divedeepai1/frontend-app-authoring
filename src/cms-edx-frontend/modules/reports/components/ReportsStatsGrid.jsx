import { BarChart3, BookOpen, TrendingUp, Users } from "lucide-react"

const ICONS = {
  classes: Users,
  students: Users,
  courses: BookOpen,
  trend: TrendingUp,
}

export default function ReportsStatsGrid({ cards }) {
  return (
    <div className="tp-reports-stats-grid">
      {cards.map((stat) => {
        const Icon = ICONS[stat.icon] || BarChart3
        return (
          <article key={stat.id} className="tp-reports-stat-card">
            <div className="tp-reports-stat-icon-wrap" style={{ backgroundColor: stat.bgColor }}>
              <Icon size={24} style={{ color: stat.color }} strokeWidth={2} aria-hidden />
            </div>
            <h3 className="tp-reports-stat-label">{stat.title}</h3>
            <p className="tp-reports-stat-value" style={{ color: stat.color }}>
              {stat.value}
            </p>
            {stat.subtitle ? <p className="tp-reports-stat-subtitle">{stat.subtitle}</p> : null}
          </article>
        )
      })}
    </div>
  )
}
