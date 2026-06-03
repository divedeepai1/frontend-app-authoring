import { useNavigate } from "react-router-dom"
import { BookOpen, FileText, FolderOpen, Users } from "lucide-react"
import { QUICK_ACCESS_CARDS } from "../data/mockHomeData"

const ICON_MAP = {
  users: Users,
  book: BookOpen,
  file: FileText,
  folder: FolderOpen,
}

export default function QuickAccessCards() {
  const navigate = useNavigate()

  return (
    <section className="tp-home-quick-access" aria-labelledby="tp-home-quick-access-title">
      <h2 id="tp-home-quick-access-title" className="tp-home-section-title">
        Quick Access
      </h2>
      <div className="tp-home-quick-grid">
        {QUICK_ACCESS_CARDS.map((card) => {
          const Icon = ICON_MAP[card.icon] || Users
          return (
            <button
              key={card.id}
              type="button"
              className="tp-home-quick-card"
              onClick={() => navigate(card.path)}
            >
              <span className="tp-home-quick-icon" aria-hidden>
                <Icon size={28} strokeWidth={1.75} />
              </span>
              <span className="tp-home-quick-label">{card.title}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
