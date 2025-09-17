import { useEffect, useState } from "react"
import { Form, Button, Row, Col } from "react-bootstrap"
import { Plus, X } from "lucide-react"
import MediaAttachment from "../common/MediaAttachment"

export default function FillInBlankQuestion({ question, onUpdate, showValidation = false }) {
  const [blankTexts, setBlankTexts] = useState(
    question.blanks && question.blanks.length > 0 ? question.blanks : ["", ""]
  )

  const addBlank = () => {
    if (blankTexts.length < 4) {
      const newBlankTexts = [...blankTexts, ""]
      setBlankTexts(newBlankTexts)
      onUpdate({ blanks: newBlankTexts })
    }
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
    if (blankTexts.length > 2 && index >= 2) {
      const newBlankTexts = blankTexts.filter((_, i) => i !== index)
      setBlankTexts(newBlankTexts)
      onUpdate({ blanks: newBlankTexts })
      // If the removed blank was the selected answer, clear the selection
      if (question.answer === index.toString()) {
        onUpdate({ answer: "" })
      }
    }
  }

  const handleAnswerSelect = (index) => {
    onUpdate({ answer: index.toString() })
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
          placeholder="Add text here. Use ____ to indicate where students should fill in answers, or add blanks below."
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
        questionType={question.type}
        questionText={question.questionText}
        media={question.media || {}}
        onMediaChange={(media) => onUpdate({ media })}
        serverImageUrl={question.imageUrl}
        serverVideoUrl={question.videoUrl}
      />

      <div className="mb-3">
        <Form.Label className="mb-2" style={{ fontSize: "14px", fontWeight: "600" }}>
          Answer Options
        </Form.Label>
        {blankTexts.map((blankText, index) => (
          <div key={index} className="d-flex align-items-center mb-2" style={{width:"100%" ,gap:"6px"}}>
            <Form.Check
              type="radio"
              id={`option-${index}-${question.id}`}
              name={`answer-${question.id}`}
              className="me-3 custom-radio"
              checked={question.answer === index.toString()}
              onChange={() => handleAnswerSelect(index)}
            />
            <Form.Control
              type="text"
              placeholder={`Blank ${index + 1}`}
              value={blankText}
              onChange={(e) => updateBlankText(index, e.target.value)}
            />
            {index >= 2 && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => removeBlank(index)}
                aria-label="Remove blank"
                style={{ minWidth: "32px", height: "32px", padding: "0" }}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        ))}
        
        {blankTexts.length < 4 && (
          <div className="mt-2">
            <Button variant="outline-secondary" size="sm" onClick={addBlank}>
              <Plus size={16} className="me-1" />
              Add Blank
            </Button>
          </div>
        )}

        {showValidation && blankTexts.filter(blank => blank?.trim()).length < 1 && (
          <div className="text-danger mt-1" style={{ fontSize: "12px" }}>
            Add at least one blank answer
          </div>
        )}

        {showValidation && !question.answer && blankTexts.filter(blank => blank?.trim()).length >= 1 && (
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
