import { Card, Form, Button } from 'react-bootstrap'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { ImageAttach } from '../ui/image-attach'

// Simple UUID generator
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function OrderingQuestion({ question, onUpdate }) {
  const handleUpdate = (field, value) => {
    onUpdate({ ...question, [field]: value })
  }

  const handleItemTextChange = (itemId, newText) => {
    const updatedItems = question.items.map((item) =>
      item.id === itemId ? { ...item, text: newText } : item
    )
    handleUpdate('items', updatedItems)
  }

  const handleAddItem = () => {
    const newItem = { id: generateId(), text: '', image_url: '', image: '' }
    handleUpdate('items', [...question.items, newItem])
  }

  const handleRemoveItem = (itemId) => {
    const updatedItems = question.items.filter((item) => item.id !== itemId)
    handleUpdate('items', updatedItems)
  }

  const handleMoveItem = (itemId, direction) => {
    const index = question.items.findIndex((item) => item.id === itemId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= question.items.length) return

    const newItems = [...question.items]
    const [movedItem] = newItems.splice(index, 1)
    newItems.splice(newIndex, 0, movedItem)
    handleUpdate('items', newItems)
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

  const handleItemImageSelect = (itemId, file) => {
    const url = URL.createObjectURL(file)
    const updatedItems = question.items.map((item) =>
      item.id === itemId ? { ...item, image_url: url, image: file.name } : item
    )
    handleUpdate('items', updatedItems)
  }
  const handleItemImageRemove = (itemId) => {
    const updatedItems = question.items.map((item) =>
      item.id === itemId ? { ...item, image_url: '', image: '' } : item
    )
    handleUpdate('items', updatedItems)
  }

  // Validation
  const natural_textError = !question.natural_text || !question.natural_text.trim()
    ? 'Question text is required.'
    : null
  const items = question.items || []
  const hasEnoughItems = items.length >= 2
  const hasEmptyItem = items.some((i) => !i.text || !i.text.trim())

  return (
    <Card className="border-start border-4" style={{ borderColor: '#ffc107' }}>
      <Card.Header>
        <h5 className="mb-0">Ordering Question</h5>
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
              placeholder="e.g., Put the following events in chronological order."
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
            <Form.Label>Items (Use arrows to reorder)</Form.Label>
            {question.items.map((item, index) => (
              <div key={item.id} className="d-flex align-items-center gap-2 mb-2">
                <span className="text-muted" style={{ minWidth: '30px' }}>
                  {index + 1}.
                </span>
                <Form.Control
                  type="text"
                  value={item.text}
                  onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                  placeholder={`Item ${index + 1}`}
                  className="flex-grow-1"
                  isInvalid={!item.text || !item.text.trim()}
                />
                <ImageAttach
                  image={item.image_url ? { url: item.image_url } : null}
                  onSelect={(file) => handleItemImageSelect(item.id, file)}
                  onRemove={() => handleItemImageRemove(item.id)}
                  label="Attach item image"
                  scope={{ questionId: question.id, kind: 'item', refId: item.id }}
                />
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleMoveItem(item.id, 'up')}
                >
                  <ArrowUp size={16} />
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleMoveItem(item.id, 'down')}
                >
                  <ArrowDown size={16} />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <button type="button" onClick={handleAddItem} className="mt-2 primary-button px-3 py-1">
              <Plus size={16} className="me-2 mb-1" /> Add Item
            </button>
            {!hasEnoughItems && (
              <div><Form.Text className="text-danger">Add at least two items.</Form.Text></div>
            )}
            {hasEmptyItem && (
              <div><Form.Text className="text-danger">Item text cannot be empty.</Form.Text></div>
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
