

import { Form, Button, Row, Col } from "react-bootstrap"
import { Plus } from "lucide-react"

export default function TrueFalseQuestion({ question, onUpdate }) {
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
          isInvalid={!question.questionText.trim()}
        />
         {!question.questionText.trim() &&<Form.Control.Feedback type="invalid">Question text is required</Form.Control.Feedback>}
      </div>

      <Row className="mb-3">
        <Col xs="auto">
          <Button variant="outline-secondary" size="sm" className="d-flex align-items-center">
            <Plus size={16} className="me-1" />
            Add Image
          </Button>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" size="sm" className="d-flex align-items-center">
            <Plus size={16} className="me-1" />
            Add Video
          </Button>
        </Col>
      </Row>

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
        {!question.answer && (
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
          isInvalid={!question.points || question.points <= 0}
        />
        {question.points <= 0 &&<Form.Control.Feedback type="invalid">Points must be greater than 0</Form.Control.Feedback>}

      </div>
    </>
  )
}
