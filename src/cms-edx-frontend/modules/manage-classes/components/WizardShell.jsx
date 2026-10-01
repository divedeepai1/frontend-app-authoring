import React from "react"

export default function WizardShell({ progress, children, embedded }) {
  if (embedded) {
    return (
      <div className="tp-wizard-shell tp-wizard-shell--embedded">
        <div className="tp-wizard-shell-body tp-wizard-shell-body--embedded">{children}</div>
      </div>
    )
  }
  return (
    <div className="tp-wizard-shell tp-card">
      {progress ? <div className="tp-wizard-progress-slot">{progress}</div> : null}
      <div className="tp-wizard-shell-body">{children}</div>
    </div>
  )
}
