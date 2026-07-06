import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export default function TpPasswordField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  autoComplete,
  error,
  required = false,
  minLength,
  pattern,
  title,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="tp-field">
      {label ? (
        <label className="tp-label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className={`tp-password-field${error ? " tp-password-field--error" : ""}`}>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          className="tp-input tp-password-field-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          required={required}
          minLength={minLength}
          pattern={pattern}
          title={title}
        />
        <button
          type="button"
          className="tp-password-field-toggle"
          onClick={() => setVisible((prev) => !prev)}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
        </button>
      </div>
      {error ? <p className="tp-field-error">{error}</p> : null}
    </div>
  )
}
