import { Pencil } from "lucide-react"
import TpCheckbox from "../../../components/common/TpCheckbox"
import TpPasswordField from "../../../components/common/TpPasswordField"
import TpLessonModalFrame from "../../lesson-modals/components/TpLessonModalFrame"
import { getStudentDisplayName } from "../utils/eligibleTargetClasses"

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <p id={id} className="tp-field-error" role="alert">
      {message}
    </p>
  )
}

export default function EditStudentModal({
  isOpen,
  onClose,
  student,
  infoForm,
  passwordForm,
  infoErrors = {},
  passwordErrors = {},
  savingInfo = false,
  savingPassword = false,
  onInfoChange,
  onPasswordChange,
  onSaveInfo,
  onSavePassword,
}) {
  const studentName = getStudentDisplayName(student)
  const busy = savingInfo || savingPassword

  const footer = (
    <div className="tp-lesson-modal-footer-inner tp-lesson-modal-footer-inner--end">
      <button type="button" className="tp-btn tp-btn-secondary" onClick={onClose} disabled={busy}>
        Close
      </button>
    </div>
  )

  return (
    <TpLessonModalFrame
      isOpen={isOpen}
      onClose={busy ? undefined : onClose}
      title="Edit Student"
      subtitle={studentName ? `Update details for ${studentName}` : "Update student details"}
      icon={Pencil}
      size="md"
      overlayClassName="tp-lesson-modal-overlay--stack"
      footer={footer}
    >
      <div className="tp-edit-student">
        <section className="tp-edit-student-section" aria-labelledby="tp-edit-student-info-heading">
          <div className="tp-edit-student-section-head">
            <h3 id="tp-edit-student-info-heading" className="tp-edit-student-section-title">
              Student information
            </h3>
            <p className="tp-edit-student-section-desc">
              Username, name, and email. Saving here does not change the password.
            </p>
          </div>

          {infoErrors.form ? (
            <div className="tp-lesson-modal-alert tp-lesson-modal-alert--error" role="alert">
              {infoErrors.form}
            </div>
          ) : null}

          <div className="tp-grid-2">
            <div className="tp-field">
              <label className="tp-label" htmlFor="tp-edit-student-username">
                Student username <span className="tp-required">*</span>
              </label>
              <input
                id="tp-edit-student-username"
                name="username"
                value={infoForm.username}
                onChange={onInfoChange}
                className={`tp-input${infoErrors.username ? " tp-input--error" : ""}`}
                autoComplete="off"
                disabled={busy}
                aria-invalid={Boolean(infoErrors.username)}
                aria-describedby={infoErrors.username ? "tp-edit-student-username-error" : undefined}
              />
              <FieldError id="tp-edit-student-username-error" message={infoErrors.username} />
            </div>

            <div className="tp-field">
              <label className="tp-label" htmlFor="tp-edit-student-email">
                Email address <span className="tp-required">*</span>
              </label>
              <input
                id="tp-edit-student-email"
                name="email"
                type="email"
                value={infoForm.email}
                onChange={onInfoChange}
                className={`tp-input${infoErrors.email ? " tp-input--error" : ""}`}
                autoComplete="email"
                disabled={busy}
                aria-invalid={Boolean(infoErrors.email)}
                aria-describedby={infoErrors.email ? "tp-edit-student-email-error" : undefined}
              />
              <FieldError id="tp-edit-student-email-error" message={infoErrors.email} />
            </div>

            <div className="tp-field">
              <label className="tp-label" htmlFor="tp-edit-student-first-name">
                First name <span className="tp-required">*</span>
              </label>
              <input
                id="tp-edit-student-first-name"
                name="firstName"
                value={infoForm.firstName}
                onChange={onInfoChange}
                className={`tp-input${infoErrors.firstName ? " tp-input--error" : ""}`}
                autoComplete="given-name"
                disabled={busy}
                aria-invalid={Boolean(infoErrors.firstName)}
                aria-describedby={infoErrors.firstName ? "tp-edit-student-first-name-error" : undefined}
              />
              <FieldError id="tp-edit-student-first-name-error" message={infoErrors.firstName} />
            </div>

            <div className="tp-field">
              <label className="tp-label" htmlFor="tp-edit-student-last-name">
                Last name <span className="tp-required">*</span>
              </label>
              <input
                id="tp-edit-student-last-name"
                name="lastName"
                value={infoForm.lastName}
                onChange={onInfoChange}
                className={`tp-input${infoErrors.lastName ? " tp-input--error" : ""}`}
                autoComplete="family-name"
                disabled={busy}
                aria-invalid={Boolean(infoErrors.lastName)}
                aria-describedby={infoErrors.lastName ? "tp-edit-student-last-name-error" : undefined}
              />
              <FieldError id="tp-edit-student-last-name-error" message={infoErrors.lastName} />
            </div>
          </div>

          <div className="tp-edit-student-section-actions">
            <button
              type="button"
              className="tp-btn tp-btn-primary"
              onClick={onSaveInfo}
              disabled={busy}
              aria-busy={savingInfo}
            >
              {savingInfo ? "Saving…" : "Save information"}
            </button>
          </div>
        </section>

        <section className="tp-edit-student-section" aria-labelledby="tp-edit-student-password-heading">
          <div className="tp-edit-student-section-head">
            <h3 id="tp-edit-student-password-heading" className="tp-edit-student-section-title">
              Set new password
            </h3>
            <p className="tp-edit-student-section-desc">
              Optionally email the new credentials to the student. This uses a separate request.
            </p>
          </div>

          {passwordErrors.form ? (
            <div className="tp-lesson-modal-alert tp-lesson-modal-alert--error" role="alert">
              {passwordErrors.form}
            </div>
          ) : null}

          <div className="tp-grid-2">
            <TpPasswordField
              id="tp-edit-student-new-password"
              name="newPassword"
              label={
                <>
                  New password <span className="tp-required">*</span>
                </>
              }
              value={passwordForm.newPassword}
              onChange={onPasswordChange}
              autoComplete="new-password"
              disabled={busy}
              error={passwordErrors.newPassword}
            />
            <TpPasswordField
              id="tp-edit-student-confirm-password"
              name="confirmPassword"
              label={
                <>
                  Confirm password <span className="tp-required">*</span>
                </>
              }
              value={passwordForm.confirmPassword}
              onChange={onPasswordChange}
              autoComplete="new-password"
              disabled={busy}
              error={passwordErrors.confirmPassword}
            />
          </div>

          <div className="tp-edit-student-email-toggle">
            <TpCheckbox
              id="tp-edit-student-send-email"
              name="sendEmail"
              checked={passwordForm.sendEmail}
              onChange={onPasswordChange}
              disabled={busy}
              label="Email the new credentials to the student"
            />
          </div>

          <div className="tp-edit-student-section-actions">
            <button
              type="button"
              className="tp-btn tp-btn-primary"
              onClick={onSavePassword}
              disabled={busy}
              aria-busy={savingPassword}
            >
              {savingPassword ? "Updating…" : "Change password"}
            </button>
          </div>
        </section>
      </div>
    </TpLessonModalFrame>
  )
}
