

import { Card, Form, Button } from 'react-bootstrap'
import { Plus, Trash2 } from 'lucide-react'
import { ImageAttach } from '../ui/image-attach'

// Simple UUID generator
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function FillInTheBlanksQuestion({ question, onUpdate }) {
  const handleUpdate = (field, value) => {
    if (typeof field === "object" && value === undefined) {
      onUpdate({ ...question, ...field });
    } else {
      onUpdate({ ...question, [field]: value });
    }
  };
  
  const handleQuestionImageSelect = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      handleUpdate({
        image_url: url,
        image_name: file.name
      });
    }
  };
  
  const handleQuestionImageRemove = () => {
    handleUpdate({
      image_url: "",
      image_name: ""
    });
  };
  

  const handleBlankAnswerChange = (blankId, newAnswer) => {
    const updatedBlanks = question.blanks.map((blank) =>
      blank.id === blankId ? { ...blank, answer: newAnswer } : blank
    )
    handleUpdate('blanks', updatedBlanks)
  }

  const handleAddBlank = () => {
    const newBlank = { id: generateId(), answer: '', image_url: '', image: '' }
    handleUpdate('blanks', [...question.blanks, newBlank])
  }

  const handleRemoveBlank = (blankId) => {
    const updatedBlanks = question.blanks.filter((blank) => blank.id !== blankId)
    handleUpdate('blanks', updatedBlanks)
  }

 

  const handleBlankImageSelect = (blankId, file) => {
    const url = URL.createObjectURL(file)
    const updated = question.blanks.map((b) => b.id === blankId ? { ...b, image_url: url, image: file.name } : b)
    handleUpdate('blanks', updated)
  }
  const handleBlankImageRemove = (blankId) => {
    const updated = question.blanks.map((b) => b.id === blankId ? { ...b, image_url: '', image: '' } : b)
    handleUpdate('blanks', updated)
  }

  // Validation
  const natural_textError = !question.natural_text || !question.natural_text.trim()
    ? 'Question text is required.'
    : null
  const blanksInText = (question.natural_text.match(/\[BLANK\]/g) || []).length
  const blanksLen = (question.blanks || []).length
  const hasMismatch = blanksInText !== blanksLen
  const hasEmptyBlank = (question.blanks || []).some((b) => !b.answer || !b.answer.trim())

  return (
    <Card className="border-start border-4 border-warning">
      <Card.Header>
        <h5 className="mb-0">Fill in the Blanks Question</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-2 d-flex justify-content-between align-items-center">
            <Form.Label className="mb-0">Question Text</Form.Label>
            <ImageAttach
              image={question.image_url ? { url: question.image_url } : null}
              onSelect={handleQuestionImageSelect}
              onRemove={handleQuestionImageRemove}
              label="Attach question image"
              scope={{ questionId: question.id, kind: 'question' }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter the sentence with blanks. Use [BLANK] for each blank (e.g., 'The capital of France is [BLANK]')."
              value={question.natural_text}
              onChange={(e) => handleUpdate('natural_text', e.target.value)}
              isInvalid={!!natural_textError || blanksInText === 0}
            />
            {natural_textError && (
              <Form.Text className="text-danger">{natural_textError}</Form.Text>
            )}
            {blanksInText === 0 && (
              <div><Form.Text className="text-danger">Include at least one [BLANK] placeholder.</Form.Text></div>
            )}
            {question.image_url && (
              <div className="mt-2"><img src={question.image_url} alt="question" style={{maxHeight:120}} /></div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Correct Answers for Blanks</Form.Label>
            {question.blanks.map((blank, index) => (
              <div key={blank.id} className="d-flex align-items-center gap-2 mb-2">
                <Form.Label className="mb-0" style={{ minWidth: '80px' }}>
                  Blank {index + 1}:
                </Form.Label>
                <Form.Control
                  type="text"
                  value={blank.answer}
                  onChange={(e) => handleBlankAnswerChange(blank.id, e.target.value)}
                  placeholder="Enter answer"
                  className="flex-grow-1"
                  isInvalid={!blank.answer || !blank.answer.trim()}
                />
                {/* <ImageAttach
                  image={blank.image_url ? { url: blank.image_url } : null}
                  onSelect={(file) => handleBlankImageSelect(blank.id, file)}
                  onRemove={() => handleBlankImageRemove(blank.id)}
                  label="Attach image"
                  scope={{ questionId: question.id, kind: 'blank', refId: blank.id }}
                /> */}
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveBlank(blank.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
             <button type="button" onClick={handleAddBlank} className="mt-2 primary-button px-3 py-1">
              <Plus size={16} className="me-2 mb-1" /> Add Blank
            </button>
            {hasMismatch && (
              <div><Form.Text className="text-danger">Number of [BLANK] placeholders must match number of answers.</Form.Text></div>
            )}
            {hasEmptyBlank && (
              <div><Form.Text className="text-danger">Blank answers cannot be empty.</Form.Text></div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Hint (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Provide hint..."
              value={question.explanation || ""}
              onChange={(e) => handleUpdate("explanation", e.target.value)}
            />
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  )
}
