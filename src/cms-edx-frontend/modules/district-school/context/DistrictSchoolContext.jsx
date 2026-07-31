import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { fetchDistrictSchool, normalizeDistrictSchool } from "../services/districtSchoolApi"

const DistrictSchoolContext = createContext({
  districtId: null,
  districtName: "",
  schoolId: null,
  schoolName: "",
  loading: false,
  error: "",
  reload: () => Promise.resolve(),
})

/** Module-level cache so navigating between portal pages does not refetch. */
let cachedContext = null
let inflightRequest = null

async function loadDistrictSchoolContext({ force = false } = {}) {
  if (!force && cachedContext) {
    return cachedContext
  }
  if (!force && inflightRequest) {
    return inflightRequest
  }

  inflightRequest = fetchDistrictSchool()
    .then((payload) => {
      cachedContext = normalizeDistrictSchool(payload)
      return cachedContext
    })
    .finally(() => {
      inflightRequest = null
    })

  return inflightRequest
}

export function DistrictSchoolProvider({ children }) {
  const [state, setState] = useState(() => ({
    districtId: cachedContext?.districtId ?? null,
    districtName: cachedContext?.districtName || "",
    schoolId: cachedContext?.schoolId ?? null,
    schoolName: cachedContext?.schoolName || "",
    loading: !cachedContext,
    error: "",
  }))

  const applyContext = useCallback((next) => {
    setState({
      districtId: next.districtId ?? null,
      districtName: next.districtName || "",
      schoolId: next.schoolId ?? null,
      schoolName: next.schoolName || "",
      loading: false,
      error: "",
    })
  }, [])

  const reload = useCallback(async ({ force = true } = {}) => {
    setState((prev) => ({ ...prev, loading: true, error: "" }))
    try {
      const next = await loadDistrictSchoolContext({ force })
      applyContext(next)
      return next
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || "Unable to load district and school.",
      }))
      return null
    }
  }, [applyContext])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (cachedContext) {
        applyContext(cachedContext)
        return
      }
      try {
        const next = await loadDistrictSchoolContext()
        if (!cancelled) applyContext(next)
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: err?.message || "Unable to load district and school.",
          }))
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [applyContext])

  const value = useMemo(
    () => ({
      ...state,
      reload,
    }),
    [state, reload]
  )

  return (
    <DistrictSchoolContext.Provider value={value}>
      {children}
    </DistrictSchoolContext.Provider>
  )
}

export function useDistrictSchool() {
  return useContext(DistrictSchoolContext)
}
