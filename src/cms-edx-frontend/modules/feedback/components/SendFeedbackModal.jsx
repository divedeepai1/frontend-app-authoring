import { useEffect, useState } from "react"
import { ChevronDown, MessageSquare } from "lucide-react"
import TpLessonModalFrame from "../../lesson-modals/components/TpLessonModalFrame"
import { submitFeedback } from "../services/feedbackApi"
import { tpToast } from "../../../components/common/tpToast"

const MESSAGE_TYPES = [
  { label: "Feedback", value: "feedback" },
  { label: "Support", value: "support" },
  { label: "Other", value: "other" },
]

export default function SendFeedbackModal({ isOpen, onClose, userName, userEmail }) {
  const [messageType, setMessageType] = useState("feedback")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setMessageType("feedback")
      setMessage("")
      setError("")
      setIsSending(false)
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!message.trim()) {
      setError("Please enter a message.")
      return
    }
    if (!userEmail) {
      setError("Unable to determine your logged-in email.")
      return
    }

    setIsSending(true)
    setError("")
    try {
      await submitFeedback({
        userName,
        userEmail,
        messageType,
        message,
      })
      tpToast.success("Feedback sent successfully.")
      onClose?.()
    } catch (err) {
      const msg = err?.message || "Unable to send feedback. Please try again."
      setError(msg)
      tpToast.error(msg)
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    if (isSending) return
    onClose?.()
  }

  const footer = (
    <div className="tp-lesson-modal-footer-inner tp-lesson-modal-footer-inner--end">
      <button
        type="button"
        className="tp-btn tp-btn-primary"
        onClick={handleSend}
        disabled={isSending || !message.trim()}
      >
        {isSending ? "Sending…" : "Send"}
      </button>
    </div>
  )

  return (
    <TpLessonModalFrame
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Feedback"
      subtitle="Share feedback, ask for help, or report an issue."
      icon={MessageSquare}
      size="md"
      footer={footer}
    >
      {error ? <div className="tp-lesson-modal-alert tp-lesson-modal-alert--error">{error}</div> : null}

      <p className="tp-feedback-intro">
        Have a question, need help, or want to share feedback? Use the form below.
      </p>

      <div className="tp-feedback-field">
        <label className="tp-feedback-label" htmlFor="tp-feedback-message-type">
          Message type
        </label>
        <div className="tp-feedback-select-wrap">
          <select
            id="tp-feedback-message-type"
            className="tp-feedback-select"
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            disabled={isSending}
          >
            {MESSAGE_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown className="tp-feedback-select-chevron" size={16} strokeWidth={2} aria-hidden />
        </div>
      </div>

      <div className="tp-feedback-field">
        <label className="tp-feedback-label" htmlFor="tp-feedback-message">
          Message
        </label>
        <textarea
          id="tp-feedback-message"
          className="tp-feedback-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          rows={6}
          disabled={isSending}
        />
        <p className="tp-feedback-hint">Please avoid sharing any sensitive personal information.</p>
      </div>
    </TpLessonModalFrame>
  )
}
