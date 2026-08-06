import { useEffect } from "react"
import { useUserProfile } from "../../user-profile/context/UserProfileContext"

export default function WelcomeBanner() {
  const { firstName, email } = useUserProfile()
  const displayName = firstName || "Teacher"

  useEffect(() => {
    if (email) {
      sessionStorage.setItem("email", email)
    }
  }, [email])

  return (
    <section className="tp-home-welcome" aria-labelledby="tp-home-welcome-title">
      <div className="tp-home-welcome-inner">
        <h2 id="tp-home-welcome-title" className="tp-home-welcome-title">
          Welcome, {displayName} – Let&apos;s get you started!
        </h2>
        <p className="tp-home-welcome-desc">
          Manage your classes, track student progress, and access curriculum tools from one place.
        </p>
      </div>
    </section>
  )
}
