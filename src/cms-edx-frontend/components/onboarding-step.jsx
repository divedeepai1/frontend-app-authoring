import { Button, Badge } from "react-bootstrap"

export function OnboardingStep({ number, title, description, buttonText }) {
  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex align-items-center mb-3">
        <Badge
          pill
          bg="transparent"
          className="border border-white d-flex align-items-center justify-content-center"
          style={{ width: "40px", height: "40px" }}
        >
          {number}
        </Badge>
        <div className="ms-2 flex-grow-1" style={{ height: "1px", backgroundColor: "rgba(255, 255, 255, 0.3)" }}></div>
      </div>
      <h3 className="fs-4 fw-semibold mb-2 text-white">{title}</h3>
      <p className="mb-4 small">{description}</p>
      <button className="mt-auto align-self-start py-2 px-3 outline-white-button">
        {buttonText}
      </button>
    </div>
  )
}
