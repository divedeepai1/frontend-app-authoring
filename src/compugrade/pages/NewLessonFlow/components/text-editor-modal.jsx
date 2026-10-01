

import { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { X } from 'lucide-react'

export function TextEditorModal({
  isOpen,
  onClose,
  onSave,
  initialLabel = '',
  initialContent = '',
}) {
  const [label, setLabel] = useState(initialLabel)
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    setLabel(initialLabel)
    setContent(initialContent)
  }, [initialLabel, initialContent, isOpen])

  const labelError = !label || !label.trim() ? 'Block label is required.' : null
  const contentError = !content || !content.trim() ? 'Content is required.' : null
  const isValid = !labelError && !contentError

  const handleSave = () => {
    if (!isValid) return
    onSave(label, content)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="modal-backdrop show" onClick={onClose}></div>
      <div className="modal show" style={{ display: 'block' }}>
        <div className="modal-dialog modal-dialog-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Text Block</h5>
              <button type="button" className="btn-close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-4">
                Add instructional content for your lesson. This will appear as a text block.
              </p>
              <Form>
                <div className="form-group mb-3">
                  <label className="form-label">Block Label</label>
                  <input
                    type="text"
                    className={`form-control${labelError ? ' is-invalid' : ''}`}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., Introduction, Key Concepts"
                  />
                  {labelError && <div className="invalid-feedback d-block">{labelError}</div>}
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Content</label>
                  <textarea
                    rows={8}
                    className={`form-control${contentError ? ' is-invalid' : ''}`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your instructional text here. (A full rich text editor can be integrated here.)"
                  />
                  {contentError && <div className="invalid-feedback d-block">{contentError}</div>}
                </div>
              </Form>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={!isValid}>
                Save Block
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
