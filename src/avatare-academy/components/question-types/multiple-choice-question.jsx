

import { Form, Button, Row, Col } from "react-bootstrap"
import { Plus, X } from "lucide-react"
import MediaAttachment from "../common/MediaAttachment"

export default function MultipleChoiceQuestion({ question, onUpdate, showValidation = false }) {
  const options = question.options && question.options.length > 0 ? question.options : ["", ""]
  const filledOptions = options.filter((opt) => opt.trim())

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  const addOption = () => {
    if (options.length < 4) {
      const newOptions = [...options, ""]
      onUpdate({ options: newOptions })
    }
  }

  const removeOption = (index) => {
    if (options.length > 2 && index >= 2) {
      const newOptions = options.filter((_, i) => i !== index)
      onUpdate({ options: newOptions })
    }
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
          Answer Options
        </Form.Label>
        {options.map((option, index) => (
          <div key={index} className="d-flex align-items-center mb-2" style={{width:"100%" ,gap:"6px"}}>
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
            {index >= 2 && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => removeOption(index)}
                style={{ minWidth: "32px", height: "32px", padding: "0" }}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        ))}
        
        {options.length < 4 && (
          <div className="mt-2">
            <Button variant="outline-secondary" size="sm" onClick={addOption}>
              <Plus size={16} className="me-1" />
              Add Option
            </Button>
          </div>
        )}

        {showValidation && filledOptions.length < 2 && (
          <div className="text-danger mt-1" style={{ fontSize: "12px" }}>
            At least 2 options are required
          </div>
        )}

        {showValidation && !question.answer && filledOptions.length >= 2 && (
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
          isInvalid={showValidation && (!question.points || question.points <= 0)}
        />
        {showValidation && (!question.points || question.points <= 0) && (
          <Form.Control.Feedback type="invalid">Points must be greater than 0</Form.Control.Feedback>
        )}

      </div>
    </>
  )
}
