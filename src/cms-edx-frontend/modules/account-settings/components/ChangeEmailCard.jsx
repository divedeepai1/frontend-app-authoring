import { Mail } from "lucide-react"
import TpPasswordField from "../../../components/common/TpPasswordField"
import { useChangeEmail } from "../hooks/useChangeEmail"

export default function ChangeEmailCard() {
  const { currentEmail, form, fieldErrors, submitting, handleChange, handleSubmit } =
    useChangeEmail()

  return (
    <section className="tp-account-card">
      <div className="tp-account-card-head">
        <div className="tp-account-card-icon" aria-hidden>
          <Mail size={20} strokeWidth={2} color="#fff" />
        </div>
        <div>
          <h2 className="tp-account-card-title">Change Email</h2>
          <p className="tp-account-card-desc">
            {currentEmail ? `Current email: ${currentEmail}` : "Update your account email address."}
          </p>
        </div>
      </div>

      <form className="tp-account-card-form" onSubmit={handleSubmit}>
        {fieldErrors.form ? (
          <p className="tp-account-form-error" role="alert">
            {fieldErrors.form}
          </p>
        ) : null}

        <TpPasswordField
          id="tp-email-current-password"
          name="oldPassword"
          label="Current Password"
          value={form.oldPassword}
          onChange={handleChange}
          placeholder="Enter current password"
          disabled={submitting}
          autoComplete="current-password"
          required
        />

        <div className="tp-field">
          <label className="tp-label" htmlFor="tp-new-email">
            New Email
          </label>
          <input
            id="tp-new-email"
            name="newEmail"
            type="email"
            className="tp-input"
            value={form.newEmail}
            onChange={handleChange}
            placeholder="Enter new email"
            disabled={submitting}
            autoComplete="email"
            required
          />
        </div>

        <div className="tp-field">
          <label className="tp-label" htmlFor="tp-confirm-email">
            Confirm Email
          </label>
          <input
            id="tp-confirm-email"
            name="confirmEmail"
            type="email"
            className="tp-input"
            value={form.confirmEmail}
            onChange={handleChange}
            placeholder="Confirm new email"
            disabled={submitting}
            autoComplete="email"
            required
          />
        </div>

        <div className="tp-account-card-actions">
          <button type="submit" className="tp-btn tp-btn-primary" disabled={submitting}>
            {submitting ? "Updating…" : "Update Email"}
          </button>
        </div>
      </form>
    </section>
  )
}
