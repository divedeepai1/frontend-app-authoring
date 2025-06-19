

import { Form, Button, Row, Col } from "react-bootstrap"
import { Plus } from "lucide-react"

export default function MultipleChoiceQuestion({ question, onUpdate }) {
  const options = question.options || ["", "", "", ""]
  const filledOptions = options.filter((opt) => opt.trim())

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

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
            {!question.questionText.trim() && <Form.Control.Feedback type="invalid">Question text is required</Form.Control.Feedback>}
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
          Answer Options
        </Form.Label>
        {options.map((option, index) => (
          <div key={index} className="d-flex align-items-center mb-2" style={{width:"20%" ,gap:"6px"}}>
            <Form.Check
              type="radio"
              id={`option-${index}-${question.id}`}
              name={`answer-${question.id}`}
              className="me-3 custom-radio"
              checked={question.answer === index.toString()}
              onChange={() => onUpdate({ answer: index.toString() })}
            />
            <Form.Control
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
            />
          </div>
        ))}
         {filledOptions.length < 4 && (
          <div className="text-danger mt-1" style={{ fontSize: "12px" }}>
            At least 4 options are required
          </div>
        )}

        {!question.answer  && filledOptions.length >= 2 && (
          <div className="text-danger mt-1" style={{ fontSize: "12px" }}>
            Please select the correct answer
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
