import { useEffect, useRef } from "react"
import "../../theme/teachers-portal-scope.css"

/**
 * Teacher portal checkbox (reference: AddClassModal course selection).
 * Use inside a `.cms-tp-scope` ancestor for styles to apply.
 */
export default function TpCheckbox({
  id,
  name,
  checked,
  onChange,
  disabled = false,
  readOnly = false,
  indeterminate = false,
  ariaLabel,
  label,
  className = "",
}) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate)
    }
  }, [indeterminate])

  const rootClass = ["tp-checkbox-root", readOnly ? "tp-checkbox-root--readonly" : "", className].filter(Boolean).join(" ")

  return (
    <div className={rootClass}>
      <label className="tp-checkbox-label" htmlFor={id}>
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          name={name}
          checked={Boolean(checked)}
          onChange={readOnly ? undefined : onChange}
          readOnly={readOnly}
          disabled={disabled && !readOnly}
          className="tp-checkbox-input"
          aria-label={ariaLabel}
          aria-checked={indeterminate ? "mixed" : checked ? "true" : "false"}
        />
        <span className="tp-checkbox-box" aria-hidden="true">
          <svg className="tp-checkbox-icon tp-checkbox-icon-check" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <svg className="tp-checkbox-icon tp-checkbox-icon-dash" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M7 12h10" />
          </svg>
        </span>
        {label ? <span className="tp-checkbox-caption">{label}</span> : null}
      </label>
    </div>
  )
}
