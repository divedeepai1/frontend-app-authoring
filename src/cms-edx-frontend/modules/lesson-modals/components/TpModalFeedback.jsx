export default function TpModalFeedback({ error, success }) {
  if (!error && !success) return null
  return (
    <>
      {error ? <div className="tp-lesson-modal-alert tp-lesson-modal-alert--error">{error}</div> : null}
      {success ? <div className="tp-lesson-modal-alert tp-lesson-modal-alert--success">{success}</div> : null}
    </>
  )
}
