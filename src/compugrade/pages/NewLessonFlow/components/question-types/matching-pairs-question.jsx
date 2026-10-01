

import { Card, Form, Button } from 'react-bootstrap'
import { Plus, Trash2 } from 'lucide-react'
import { ImageAttach } from '../ui/image-attach'

// Simple UUID generator
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function MatchingPairsQuestion({ question, onUpdate }) {
  const handleUpdate = (field, value) => {
    onUpdate({ ...question, [field]: value })
  }

  const handlePairChange = (pairId, field, value) => {
    const updatedPairs = question.pairs.map((pair) =>
      pair.id === pairId ? { ...pair, [field]: value } : pair
    )
    handleUpdate('pairs', updatedPairs)
  }

  const handleAddPair = () => {
    const newPair = { id: generateId(), term: '', definition: '', term_image_url: '', term_image: '', definition_image_url: '', definition_image: '' }
    handleUpdate('pairs', [...question.pairs, newPair])
  }

  const handleRemovePair = (pairId) => {
    const updatedPairs = question.pairs.filter((pair) => pair.id !== pairId)
    handleUpdate('pairs', updatedPairs)
  }

  const handleQuestionImageSelect = (file) => {
    const url = URL.createObjectURL(file)
    handleUpdate('image_url', url)
    handleUpdate('image_name', file.name)
  }
  const handleQuestionImageRemove = () => {
    handleUpdate('image_url', '')
    handleUpdate('image_name', '')
  }

  const handlePairImageSelect = (pairId, keyUrl, keyName, file) => {
    const url = URL.createObjectURL(file)
    const updated = question.pairs.map((p) => p.id === pairId ? { ...p, [keyUrl]: url, [keyName]: file.name } : p)
    handleUpdate('pairs', updated)
  }
  const handlePairImageRemove = (pairId, keyUrl, keyName) => {
    const updated = question.pairs.map((p) => p.id === pairId ? { ...p, [keyUrl]: '', [keyName]: '' } : p)
    handleUpdate('pairs', updated)
  }

  // Validation
  const natural_textError = !question.natural_text || !question.natural_text.trim()
    ? 'Question text is required.'
    : null
  const pairs = question.pairs || []
  const hasEnoughPairs = pairs.length >= 2
  const hasEmptyFields = pairs.some((p) => !p.term || !p.term.trim() || !p.definition || !p.definition.trim())

  return (
    <Card className="border-start border-4 border-danger">
      <Card.Header>
        <h5 className="mb-0">Matching Pairs Question</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-2 d-flex justify-content-between align-items-center">
            <Form.Label className="mb-0">Question Text (Instructions)</Form.Label>
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
              placeholder="e.g., Match the terms on the left with their definitions on the right."
              value={question.natural_text}
              onChange={(e) => handleUpdate('natural_text', e.target.value)}
              isInvalid={!!natural_textError}
            />
            {natural_textError && (
              <Form.Text className="text-danger">{natural_textError}</Form.Text>
            )}
            {question.image_url && (
              <div className="mt-2"><img src={question.image_url} alt="question" style={{maxHeight:120}} /></div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Pairs</Form.Label>
            {question.pairs.map((pair, index) => (
              <div key={pair.id} className="d-flex align-items-center gap-2 mb-2">
                <Form.Control
                  type="text"
                  value={pair.term}
                  onChange={(e) => handlePairChange(pair.id, 'term', e.target.value)}
                  placeholder={`Term ${index + 1}`}
                  className="flex-fill"
                  isInvalid={!pair.term || !pair.term.trim()}
                />
                <ImageAttach
                  image={pair.term_image_url ? { url: pair.term_image_url } : null}
                  onSelect={(file) => handlePairImageSelect(pair.id, 'term_image_url', 'term_image', file)}
                  onRemove={() => handlePairImageRemove(pair.id, 'term_image_url', 'term_image')}
                  label="Attach term image"
                  scope={{ questionId: question.id, kind: 'pair-term', refId: pair.id, role: 'term' }}
                />
                <Form.Control
                  type="text"
                  value={pair.definition}
                  onChange={(e) => handlePairChange(pair.id, 'definition', e.target.value)}
                  placeholder={`Definition ${index + 1}`}
                  className="flex-fill"
                  isInvalid={!pair.definition || !pair.definition.trim()}
                />
                <ImageAttach
                  image={pair.definition_image_url ? { url: pair.definition_image_url } : null}
                  onSelect={(file) => handlePairImageSelect(pair.id, 'definition_image_url', 'definition_image', file)}
                  onRemove={() => handlePairImageRemove(pair.id, 'definition_image_url', 'definition_image')}
                  label="Attach definition image"
                  scope={{ questionId: question.id, kind: 'pair-definition', refId: pair.id, role: 'definition' }}
                />
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemovePair(pair.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
             <button type="button" onClick={handleAddPair} className="mt-2 primary-button px-3 py-1">
              <Plus size={16} className="me-2 mb-1" /> Add Pair
            </button>
            {!hasEnoughPairs && (
              <div><Form.Text className="text-danger">Add at least two pairs.</Form.Text></div>
            )}
            {hasEmptyFields && (
              <div><Form.Text className="text-danger">Terms and definitions cannot be empty.</Form.Text></div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Hint (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Provide hint..."
              value={question.explanation || ''}
              onChange={(e) => handleUpdate('explanation', e.target.value)}
            />
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  )
}
