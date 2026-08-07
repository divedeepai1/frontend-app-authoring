import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Bell, ChevronDown, LogOut, MessageSquare, Settings } from "lucide-react"
import { useNavigate } from "react-router"
import { appendNextToLogoutUrl, getLogoutNextDestination } from "./buildLogoutNextUrl"
import { getEdxUserInitials, parseEdxUserInfoCookie } from "./parseEdxUserInfoCookie"
import SendFeedbackModal from "../modules/feedback/components/SendFeedbackModal"
import DistrictSchoolHeaderMeta from "../modules/district-school/components/DistrictSchoolHeaderMeta"
import { useUserProfile } from "../modules/user-profile/context/UserProfileContext"

export default function TeacherPortalHeader({ title, subtitle }) {
  const navigate = useNavigate()
  const profile = useUserProfile()
  const [open, setOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const wrapRef = useRef(null)
  const [cookieUser, setCookieUser] = useState(() => parseEdxUserInfoCookie())

  useEffect(() => {
    setCookieUser(parseEdxUserInfoCookie())
  }, [])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close()
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open, close])

  const urls = cookieUser?.header_urls || {}
  const displayName = profile.firstName || cookieUser?.username || "User"
  const displayEmail = profile.email || cookieUser?.email || ""
  const initials = useMemo(
    () =>
      getEdxUserInitials({
        ...(cookieUser || {}),
        name: profile.fullName || cookieUser?.name,
        first_name: profile.firstName,
        username: profile.username || cookieUser?.username,
        email: displayEmail,
      }),
    [cookieUser, profile.firstName, profile.fullName, profile.username, displayEmail]
  )

  const go = (href) => {
    if (href) window.location.assign(href)
    close()
  }

  const goAccountSettings = () => {
    navigate("/account-settings")
    close()
  }

  const openFeedback = () => {
    setIsFeedbackOpen(true)
    close()
  }

  const goLogout = () => {
    const base = urls.logout
    if (!base) return
    const nextDest = getLogoutNextDestination()
    const href = nextDest ? appendNextToLogoutUrl(base, nextDest) : base
    go(href)
  }

  return (
    <header className="tp-portal-header">
      <div className="tp-portal-header-left">
        {title ? (
          <div className="tp-portal-header-page-title">
            <h1 className="tp-portal-header-title">{title}</h1>
            {subtitle ? <p className="tp-portal-header-subtitle">{subtitle}</p> : null}
          </div>
        ) : null}
        <DistrictSchoolHeaderMeta />
      </div>

      <div className="tp-portal-header-right">
        <button type="button" className="tp-portal-header-icon-btn" aria-label="Notifications">
          <Bell size={20} strokeWidth={2} className="tp-portal-header-bell-icon" aria-hidden />
          <span className="tp-portal-header-bell-dot" aria-hidden />
        </button>

        <div className="tp-portal-header-profile-wrap" ref={wrapRef}>
          <button
            type="button"
            className="tp-portal-header-profile-btn"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="true"
          >
            <div className="tp-portal-header-avatar">
              <span className="tp-portal-header-avatar-fallback">{initials}</span>
            </div>
            <div className="tp-portal-header-profile-text">
              <p className="tp-portal-header-name">{displayName}</p>
              {displayEmail ? <p className="tp-portal-header-email">{displayEmail}</p> : null}
            </div>
            <ChevronDown size={16} strokeWidth={2} className="tp-portal-header-chevron" aria-hidden />
          </button>

          {open ? (
            <div className="tp-portal-header-dropdown" role="menu">
              <button
                type="button"
                className="tp-portal-header-dropdown-item"
                role="menuitem"
                onClick={goAccountSettings}
              >
                <Settings size={18} strokeWidth={1.75} aria-hidden />
                Account settings
              </button>
              <button
                type="button"
                className="tp-portal-header-dropdown-item"
                role="menuitem"
                onClick={openFeedback}
              >
                <MessageSquare size={18} strokeWidth={1.75} aria-hidden />
                Send Feedback
              </button>
              {urls.logout ? (
                <button
                  type="button"
                  className="tp-portal-header-dropdown-item tp-portal-header-dropdown-danger"
                  role="menuitem"
                  onClick={goLogout}
                >
                  <LogOut size={18} strokeWidth={1.75} aria-hidden />
                  Log out
                </button>
              ) : null}
              {!urls.logout ? (
                <div className="tp-portal-header-dropdown-empty">No logout URL in session cookie.</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <SendFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        userName={displayName}
        userEmail={displayEmail}
      />
    </header>
  )
}
