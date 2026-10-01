import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { parseEdxUserInfoCookie } from "../../../layout/parseEdxUserInfoCookie"
import {
  fetchUserAccount,
  normalizeUserAccount,
  resolveUsernameFromSession,
} from "../services/userAccountApi"

const UserProfileContext = createContext({
  username: "",
  email: "",
  fullName: "",
  firstName: "",
  loading: false,
  error: "",
  reload: () => Promise.resolve(),
})

/** Module-level cache so portal page navigations do not refetch. */
let cachedProfile = null
let inflightRequest = null

function cookieFallbackProfile() {
  const cookieUser = parseEdxUserInfoCookie()
  return normalizeUserAccount({}, cookieUser)
}

async function loadUserProfile({ force = false } = {}) {
  if (!force && cachedProfile) {
    return cachedProfile
  }
  if (!force && inflightRequest) {
    return inflightRequest
  }

  const username = resolveUsernameFromSession()
  if (!username) {
    cachedProfile = cookieFallbackProfile()
    return cachedProfile
  }

  inflightRequest = fetchUserAccount(username)
    .then((payload) => {
      cachedProfile = normalizeUserAccount(payload, parseEdxUserInfoCookie())
      return cachedProfile
    })
    .catch(() => {
      cachedProfile = cookieFallbackProfile()
      return cachedProfile
    })
    .finally(() => {
      inflightRequest = null
    })

  return inflightRequest
}

export function UserProfileProvider({ children }) {
  const cookieFallback = cookieFallbackProfile()
  const [state, setState] = useState(() => ({
    username: cachedProfile?.username || cookieFallback.username || "",
    email: cachedProfile?.email || cookieFallback.email || "",
    fullName: cachedProfile?.fullName || cookieFallback.fullName || "",
    firstName: cachedProfile?.firstName || cookieFallback.firstName || "",
    loading: !cachedProfile,
    error: "",
  }))

  const applyProfile = useCallback((next) => {
    setState({
      username: next.username || "",
      email: next.email || "",
      fullName: next.fullName || "",
      firstName: next.firstName || "",
      loading: false,
      error: "",
    })
  }, [])

  const reload = useCallback(async ({ force = true } = {}) => {
    setState((prev) => ({ ...prev, loading: true, error: "" }))
    try {
      const next = await loadUserProfile({ force })
      applyProfile(next)
      return next
    } catch (err) {
      const fallback = cookieFallbackProfile()
      setState({
        ...fallback,
        loading: false,
        error: err?.message || "Unable to load user profile.",
      })
      return fallback
    }
  }, [applyProfile])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (cachedProfile) {
        applyProfile(cachedProfile)
        return
      }
      const next = await loadUserProfile()
      if (!cancelled) applyProfile(next)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [applyProfile])

  const value = useMemo(
    () => ({
      ...state,
      reload,
    }),
    [state, reload]
  )

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  return useContext(UserProfileContext)
}
