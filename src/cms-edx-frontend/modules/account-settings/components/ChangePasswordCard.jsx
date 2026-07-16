import { Lock } from "lucide-react"
import TpPasswordField from "../../../components/common/TpPasswordField"
import { useChangePassword } from "../hooks/useChangePassword"

export default function ChangePasswordCard() {
  const {
    form,
    fieldErrors,
    passwordHint,
    passwordMinLength,
    passwordPattern,
    submitting,
    handleChange,
    handleSubmit,
  } = useChangePassword()

  return (
    <section className="tp-account-card">
      <div className="tp-account-card-head">
        <div className="tp-account-card-icon" aria-hidden>
          <Lock size={20} strokeWidth={2} color="#fff" />
        </div>
        <div>
          <h2 className="tp-account-card-title">Change Password</h2>
          <p className="tp-account-card-desc">Update your account password.</p>
        </div>
      </div>

      <form className="tp-account-card-form" onSubmit={handleSubmit}>
        {fieldErrors.form ? (
          <p className="tp-account-form-error" role="alert">
            {fieldErrors.form}
          </p>
        ) : null}

        <TpPasswordField
          id="tp-current-password"
          name="oldPassword"
          label="Current Password"
          value={form.oldPassword}
          onChange={handleChange}
          placeholder="Enter current password"
          disabled={submitting}
          autoComplete="current-password"
          required
        />

        <TpPasswordField
          id="tp-new-password"
          name="newPassword"
          label="New Password"
          value={form.newPassword}
          onChange={handleChange}
          placeholder="Enter new password"
          disabled={submitting}
          autoComplete="new-password"
          required
          minLength={passwordMinLength}
          pattern={passwordPattern}
          title={passwordHint}
        />

        <TpPasswordField
          id="tp-confirm-password"
          name="confirmPassword"
          label="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm new password"
          disabled={submitting}
          autoComplete="new-password"
          required
          minLength={passwordMinLength}
        />

        <p className="tp-account-field-hint">{passwordHint}</p>

        <div className="tp-account-card-actions">
          <button type="submit" className="tp-btn tp-btn-primary" disabled={submitting}>
            {submitting ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  )
}
