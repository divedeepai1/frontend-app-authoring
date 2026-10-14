/** Full idle period before automatic logout. */
export const INACTIVITY_IDLE_MS = 15 * 60 * 1000

/** Show warning this long before logout. */
export const INACTIVITY_WARNING_BEFORE_MS = 60 * 1000

export const INACTIVITY_WARNING_MESSAGE =
  "You'll be logged out in 1 minute due to inactivity"

/** Throttle activity resets so mousemove does not thrash timers. */
export const INACTIVITY_ACTIVITY_THROTTLE_MS = 1000

/** Cross-tab last-activity key (same origin). */
export const INACTIVITY_STORAGE_KEY = "tp_inactivity_last_activity_at"

export const INACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
  "wheel",
]
