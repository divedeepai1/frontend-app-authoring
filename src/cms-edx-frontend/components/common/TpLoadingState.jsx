import "../../theme/teachers-portal-scope.css"

export default function TpLoadingState({
  label = "Loading…",
  className = "",
}) {
  const rootClass = ["tp-loading-state", className].filter(Boolean).join(" ")

  return (
    <div className={rootClass} role="status" aria-live="polite" aria-busy="true">
      <div className="tp-loading-spinner" aria-hidden="true" />
      {label ? <span className="tp-loading-text">{label}</span> : null}
    </div>
  )
}
