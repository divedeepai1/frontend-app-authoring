import React from "react"
import { reportReactError } from "./errorTracking"

/**
 * Teacher LMS error boundary — reports to SigNoz without crashing the whole shell forever.
 */
export default class TelemetryErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    try {
      reportReactError(error, info)
    } catch {
      // never break the product on telemetry failure
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback({ retry: this.handleRetry })
      }
      return (
        <div className="tp-portal-main" role="alert" style={{ padding: "2rem" }}>
          <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
          <p>An unexpected error occurred. You can try again or reload the page.</p>
          <button type="button" className="tp-btn tp-btn-primary" onClick={this.handleRetry}>
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
