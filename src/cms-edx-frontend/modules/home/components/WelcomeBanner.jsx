import { useEffect, useState } from "react"
import { parseEdxUserInfoCookie } from "../../../layout/parseEdxUserInfoCookie"
import { ONBOARDING_STEPS } from "../data/mockHomeData"

function formatDisplayName(username) {
  if (!username || typeof username !== "string") return "Teacher"
  return username.charAt(0).toUpperCase() + username.slice(1)
}

export default function WelcomeBanner() {
  const [displayName, setDisplayName] = useState("Teacher")

  useEffect(() => {
    const user = parseEdxUserInfoCookie()
    if (user?.username) {
      sessionStorage.setItem("email", user.email || "")
      setDisplayName(formatDisplayName(user.username))
    }
  }, [])

  return (
    <section className="tp-home-welcome" aria-labelledby="tp-home-welcome-title">
      <div className="tp-home-welcome-inner">
        <h2 id="tp-home-welcome-title" className="tp-home-welcome-title">
          Welcome, {displayName} – Let&apos;s get you started!
        </h2>
        <p className="tp-home-welcome-desc">
          Follow these steps to set up your account and tools for success. We&apos;ve tailored this checklist
          based on your purchases.
        </p>
        <div className="tp-home-onboarding-grid">
          {ONBOARDING_STEPS.map((step) => (
            <article key={step.id} className="tp-home-onboarding-card">
              <div className="tp-home-onboarding-step-row">
                <span className="tp-home-onboarding-badge">{step.id}</span>
                <span className="tp-home-onboarding-line" aria-hidden />
              </div>
              <h3 className="tp-home-onboarding-title">{step.title}</h3>
              <p className="tp-home-onboarding-desc">{step.description}</p>
              <button type="button" className="tp-home-onboarding-btn">
                {step.buttonLabel}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
