export default function ExpandSubsectionToggle({ checked, onChange }) {
  return (
    <label className="tp-curriculum-expand-toggle">
      <span className="tp-curriculum-expand-toggle-label">Expand subsection</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`tp-curriculum-expand-switch${checked ? " tp-curriculum-expand-switch--on" : ""}`}
        onClick={onChange}
      >
        <span className="tp-curriculum-expand-switch-knob" />
      </button>
    </label>
  )
}
