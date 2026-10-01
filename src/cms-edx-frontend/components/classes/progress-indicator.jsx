import React from "react"

const STEPS = [
  { id: 1, label: "Class Details" },
  { id: 2, label: "Add Students" },
  { id: 3, label: "Assign Course(s)" },
]

const ProgressIndicator = ({ activeStep }) => (
  <div className="tp-wizard-steps" role="navigation" aria-label="Class setup steps">
    <ol className="tp-wizard-steps-list">
      {STEPS.map((step, index) => {
        const done = step.id < activeStep
        const active = step.id === activeStep
        const circleClass = done
          ? "tp-wizard-steps-circle tp-wizard-steps-circle-done"
          : active
            ? "tp-wizard-steps-circle tp-wizard-steps-circle-active"
            : "tp-wizard-steps-circle tp-wizard-steps-circle-todo"
        const numClass =
          done || active ? "tp-wizard-steps-num tp-wizard-steps-num-on" : "tp-wizard-steps-num tp-wizard-steps-num-off"
        const labelClass =
          done || active
            ? "tp-wizard-steps-label tp-wizard-steps-label-active"
            : "tp-wizard-steps-label tp-wizard-steps-label-todo"

        return (
          <li key={step.id} className="tp-wizard-steps-segment" aria-current={active ? "step" : undefined}>
            <div className="tp-wizard-steps-node">
              <div className={circleClass}>
                <span className={numClass}>{step.id}</span>
              </div>
              <span className={labelClass}>{step.label}</span>
            </div>
            {index < STEPS.length - 1 ? (
              <div
                className={
                  activeStep > step.id
                    ? "tp-wizard-steps-connector tp-wizard-steps-connector-done"
                    : "tp-wizard-steps-connector"
                }
                aria-hidden
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  </div>
)

export default ProgressIndicator
