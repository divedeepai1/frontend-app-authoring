export default function CourseDisableByDefaultToggle({
  checked,
  loading,
  saving,
  disabled,
  error,
  onToggle,
}) {
  const isBusy = loading || saving
  const isDisabled = disabled || isBusy || !onToggle

  return (
    <div className="tp-curriculum-pref">
      <div className="tp-curriculum-pref-copy">
        <span className="tp-curriculum-pref-title">Disable by default</span>
        <span className="tp-curriculum-pref-desc">
          When on, this course starts disabled for students
        </span>
        {error ? (
          <span className="tp-curriculum-pref-error" role="alert">
            {error}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-busy={isBusy}
        aria-label="Disable course by default"
        disabled={isDisabled}
        className={[
          "tp-curriculum-pref-switch",
          checked ? "tp-curriculum-pref-switch--on" : "",
          isBusy ? "tp-curriculum-pref-switch--busy" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={onToggle}
      >
        <span className="tp-curriculum-pref-switch-knob" />
      </button>
    </div>
  )
}
