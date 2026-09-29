import { useCallback, useEffect, useRef } from "react"
import {
  INACTIVITY_ACTIVITY_THROTTLE_MS,
  INACTIVITY_EVENTS,
  INACTIVITY_IDLE_MS,
  INACTIVITY_STORAGE_KEY,
  INACTIVITY_WARNING_BEFORE_MS,
} from "./inactivityConstants"

function readSharedActivityAt() {
  try {
    const raw = window.localStorage.getItem(INACTIVITY_STORAGE_KEY)
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

function writeSharedActivityAt(timestamp) {
  try {
    window.localStorage.setItem(INACTIVITY_STORAGE_KEY, String(timestamp))
  } catch {
    // Ignore quota / private-mode failures; single-tab timers still work.
  }
}

/**
 * Schedules an inactivity warning and logout. Resets on user activity
 * (throttled) and syncs lightly across tabs via localStorage.
 *
 * Logout runs only after a full idle period — never on a timer alone without
 * checking last activity.
 */
export default function useInactivityLogout({
  enabled = true,
  idleMs = INACTIVITY_IDLE_MS,
  warningBeforeMs = INACTIVITY_WARNING_BEFORE_MS,
  onWarning,
  onLogout,
  onActivity,
} = {}) {
  const lastActivityRef = useRef(Date.now())
  const warningShownRef = useRef(false)
  const warningTimerRef = useRef(null)
  const logoutTimerRef = useRef(null)
  const throttleRef = useRef(0)

  const onWarningRef = useRef(onWarning)
  const onLogoutRef = useRef(onLogout)
  const onActivityRef = useRef(onActivity)
  onWarningRef.current = onWarning
  onLogoutRef.current = onLogout
  onActivityRef.current = onActivity

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current != null) {
      window.clearTimeout(warningTimerRef.current)
      warningTimerRef.current = null
    }
    if (logoutTimerRef.current != null) {
      window.clearTimeout(logoutTimerRef.current)
      logoutTimerRef.current = null
    }
  }, [])

  const scheduleFrom = useCallback(
    (activityAt) => {
      clearTimers()

      const warningDelay = Math.max(idleMs - warningBeforeMs, 0)
      const logoutDelay = idleMs
      const startedAt = activityAt

      warningTimerRef.current = window.setTimeout(() => {
        if (lastActivityRef.current !== startedAt) return
        const elapsed = Date.now() - lastActivityRef.current
        if (elapsed < warningDelay) return
        if (warningShownRef.current) return
        warningShownRef.current = true
        onWarningRef.current?.()
      }, warningDelay)

      logoutTimerRef.current = window.setTimeout(() => {
        if (lastActivityRef.current !== startedAt) return
        const elapsed = Date.now() - lastActivityRef.current
        if (elapsed < logoutDelay) return
        onLogoutRef.current?.()
      }, logoutDelay)
    },
    [clearTimers, idleMs, warningBeforeMs]
  )

  const markActivity = useCallback(
    (timestamp = Date.now(), { broadcast = true, notify = true } = {}) => {
      const hadWarning = warningShownRef.current
      lastActivityRef.current = timestamp
      warningShownRef.current = false
      if (broadcast) writeSharedActivityAt(timestamp)
      if (notify && hadWarning) onActivityRef.current?.()
      scheduleFrom(timestamp)
    },
    [scheduleFrom]
  )

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined

    markActivity(Date.now(), { broadcast: true })

    const onUserActivity = () => {
      const now = Date.now()
      if (now - throttleRef.current < INACTIVITY_ACTIVITY_THROTTLE_MS) return
      throttleRef.current = now
      markActivity(now, { broadcast: true })
    }

    const onStorage = (event) => {
      if (event.key !== INACTIVITY_STORAGE_KEY || event.newValue == null) return
      const sharedAt = Number(event.newValue)
      if (!Number.isFinite(sharedAt)) return
      if (sharedAt <= lastActivityRef.current) return
      markActivity(sharedAt, { broadcast: false })
    }

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return
      const sharedAt = readSharedActivityAt()
      const baseline = Math.max(lastActivityRef.current, sharedAt || 0)
      const elapsed = Date.now() - baseline
      lastActivityRef.current = baseline

      if (elapsed >= idleMs) {
        onLogoutRef.current?.()
        return
      }
      if (elapsed >= idleMs - warningBeforeMs) {
        if (!warningShownRef.current) {
          warningShownRef.current = true
          onWarningRef.current?.()
        }
        scheduleFrom(baseline)
        return
      }
      markActivity(baseline, { broadcast: false })
    }

    INACTIVITY_EVENTS.forEach((name) => {
      window.addEventListener(name, onUserActivity, { passive: true })
    })
    window.addEventListener("storage", onStorage)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      clearTimers()
      INACTIVITY_EVENTS.forEach((name) => {
        window.removeEventListener(name, onUserActivity)
      })
      window.removeEventListener("storage", onStorage)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [
    clearTimers,
    enabled,
    idleMs,
    markActivity,
    scheduleFrom,
    warningBeforeMs,
  ])
}
