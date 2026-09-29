import { useCallback, useRef } from "react"
import { tpToast } from "../components/common/tpToast"
import {
  INACTIVITY_IDLE_MS,
  INACTIVITY_WARNING_BEFORE_MS,
  INACTIVITY_WARNING_MESSAGE,
} from "./inactivityConstants"
import { performTeacherPortalLogout } from "./performTeacherPortalLogout"
import useInactivityLogout from "./useInactivityLogout"

/**
 * Mount once inside TeacherPortalShell (under TpToastProvider).
 * Logs out only after sustained inactivity — same logout URL as the header.
 */
export default function InactivityLogoutWatcher() {
  const warningToastIdRef = useRef(null)
  const loggingOutRef = useRef(false)

  const dismissWarningToast = useCallback(() => {
    if (warningToastIdRef.current != null) {
      tpToast.dismiss(warningToastIdRef.current)
      warningToastIdRef.current = null
    }
  }, [])

  const handleWarning = useCallback(() => {
    dismissWarningToast()
    warningToastIdRef.current = tpToast.info(INACTIVITY_WARNING_MESSAGE, {
      duration: INACTIVITY_WARNING_BEFORE_MS,
    })
  }, [dismissWarningToast])

  const handleLogout = useCallback(() => {
    if (loggingOutRef.current) return
    loggingOutRef.current = true
    dismissWarningToast()
    const navigated = performTeacherPortalLogout()
    if (!navigated) {
      loggingOutRef.current = false
      tpToast.error("Unable to log out automatically. Please use Log out from the menu.")
    }
  }, [dismissWarningToast])

  const handleActivityReset = useCallback(() => {
    dismissWarningToast()
  }, [dismissWarningToast])

  useInactivityLogout({
    enabled: true,
    idleMs: INACTIVITY_IDLE_MS,
    warningBeforeMs: INACTIVITY_WARNING_BEFORE_MS,
    onWarning: handleWarning,
    onLogout: handleLogout,
    onActivity: handleActivityReset,
  })

  return null
}
