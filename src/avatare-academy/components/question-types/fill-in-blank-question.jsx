import { useEffect, useState } from "react"
import { Form, Button, Row, Col } from "react-bootstrap"
import { Plus, X } from "lucide-react"

export default function FillInBlankQuestion({ question, onUpdate }) {
  const [blankTexts, setBlankTexts] = useState([""])

  const addBlank = () => {
    setBlankTexts([...blankTexts, ""])
  }

  useEffect(() => {
    if (Array.isArray(question.blanks) && question.blanks.length > 0) {
      setBlankTexts(question.blanks)
    }
  }, [question])

  const updateBlankText = (index, value) => {
    const newBlankTexts = [...blankTexts]
    newBlankTexts[index] = value
    setBlankTexts(newBlankTexts)
    onUpdate({ blanks: newBlankTexts })
  }

  const removeBlank = (index) => {
    const newBlankTexts = blankTexts.filter((_, i) => i !== index)
    setBlankTexts(newBlankTexts)
    onUpdate({ blanks: newBlankTexts })
  }

  // Validation checks
  const hasQuestionText = question.questionText.trim().length > 0
  const filledBlanks = blankTexts.filter((blank) => blank.trim().length > 0)
  const hasFilledBlanks = filledBlanks.length > 0
  const hasValidBlanks = hasFilledBlanks

  return (
    <>
      <div className="mb-3">
        <Form.Label className="mb-2" style={{ fontSize: "14px", fontWeight: "600" }}>
          Question Text
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          placeholder="Add text here. Use ____ to indicate where students should fill in answers, or add blanks below."
          value={question.questionText}
          onChange={(e) => onUpdate({ questionText: e.target.value })}
          style={{ resize: "vertical" }}
          isInvalid={!hasQuestionText}
        />
        {!hasQuestionText && (
          <Form.Control.Feedback type="invalid">
            Question text is required
          </Form.Control.Feedback>
        )}
      </div>

      {blankTexts.map((blankText, index) => (
        <Row key={index} className="mb-2 align-items-center">
          <Col>
            <Form.Control
              type="text"
              placeholder="Add blank text here"
              value={blankText}
              onChange={(e) => updateBlankText(index, e.target.value)}
            />
          </Col>
          <Col xs="auto">
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => removeBlank(index)}
              aria-label="Remove blank"
            >
              <X size={16} />
            </Button>
          </Col>
        </Row>
      ))}

      {!hasValidBlanks && (
        <div className="text-danger mt-2" style={{ fontSize: "14px" }}>
          Please add at least one blank answer.
        </div>
      )}

      <Row className="mb-3">
        <Col xs="auto">
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center"
            onClick={addBlank}
          >
            <Plus size={16} className="me-1" />
            Add Blank
          </Button>
        </Col>
      </Row>

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
          Answer Points
        </Form.Label>
        <Form.Control
          type="number"
          value={question.points}
          onChange={(e) => onUpdate({ points: Number.parseInt(e.target.value) || 0 })}
          style={{ width: "150px" }}
          isInvalid={!question.points || question.points <= 0}
        />
        {question.points <= 0 && (
          <Form.Control.Feedback type="invalid">
            Points must be greater than 0
          </Form.Control.Feedback>
        )}
      </div>
    </>
  )
}
