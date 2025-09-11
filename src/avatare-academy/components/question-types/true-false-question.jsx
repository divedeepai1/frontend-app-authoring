

import { Form, Button, Row, Col } from "react-bootstrap"
import { Plus } from "lucide-react"
import MediaAttachment from "../common/MediaAttachment"

export default function TrueFalseQuestion({ question, onUpdate, showValidation = false }) {
  return (
    <>
      <div className="mb-3">
        <Form.Label className="mb-2" style={{ fontSize: "14px", fontWeight: "600" }}>
          Question Text
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={question.questionText}
          onChange={(e) => onUpdate({ questionText: e.target.value })}
          style={{ resize: "vertical" }}
          isInvalid={showValidation && !question.questionText.trim()}
        />
        {showValidation && !question.questionText.trim() && (
          <Form.Control.Feedback type="invalid">Question text is required</Form.Control.Feedback>
        )}
      </div>

      <MediaAttachment 
        questionId={question.id}
        media={question.media || {}}
        onMediaChange={(media) => onUpdate({ media })}
      />

      <div className="mb-3">
        <Form.Label className="mb-2" style={{ fontSize: "14px", fontWeight: "600" }}>
          Answer
        </Form.Label>
        <div style={{ display: "flex", flexDirection:"column", gap:"8px"}}>
          <Form.Check
            type="radio"
            id={`true-option-${question.id}`}
            name={`answer-${question.id}`}
            label="True"
            className="me-3 custom-radio"
            checked={question.answer === "true"}
            onChange={() => onUpdate({ answer: "true" })}
            inline
          
          />
          <Form.Check
            type="radio"
            id={`false-option-${question.id}`}
            name={`answer-${question.id}`}
            label="False"
            className="me-3 custom-radio"
            checked={question.answer === "false"}
            onChange={() => onUpdate({ answer: "false" })}
            inline
          />
        </div>
        {showValidation && !question.answer && (
          <div className="text-danger mt-1" style={{ fontSize: "14px" }}>
            Please select an answer
          </div>
        )}
      </div>

      <div className="mb-3">
        <Form.Label className="mb-2" style={{ fontSize: "14px", fontWeight: "600" }}>
          Answer Points
        </Form.Label>
        <Form.Control
          type="number"
          value={question.points}
          onChange={(e) => onUpdate({ points: Number.parseInt(e.target.value) || 0 })}
          style={{ width: "150px" }}
          isInvalid={showValidation && (!question.points || question.points <= 0)}
        />
        {showValidation && (!question.points || question.points <= 0) && (
          <Form.Control.Feedback type="invalid">Points must be greater than 0</Form.Control.Feedback>
        )}

      </div>
    </>
  )
}
