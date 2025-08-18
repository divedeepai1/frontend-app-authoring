import { useRef } from 'react'
import { Button } from 'react-bootstrap'
import { Paperclip, X } from 'lucide-react'
import { useImages } from './images-context'

// scope: { questionId: string, kind: 'question'|'option'|'answer'|'item'|'blank'|'pair-term'|'pair-definition'|'category', refId?: string, role?: string }
export function ImageAttach({ image, onSelect, onRemove, label = 'Attach image', scope }) {
  const inputRef = useRef(null)
  const { addImage, addImageWithScope } = useImages()

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      let record
      if (scope && scope.questionId && scope.kind) {
        record = addImageWithScope({ ...scope, file })
      } else {
        record = addImage(file)
      }
      if (onSelect) {
        onSelect(file, record)
      }
      e.target.value = ''
    }
  }

  return (
    <div className="d-flex align-items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="d-none"
        onChange={handleChange}
      />
      <Button variant="outline-secondary" size="sm" onClick={handleClick} title={label}>
        <Paperclip size={16} />
      </Button>
      {image?.url && (
  <div
    className="position-relative border rounded"
    style={{ width: 64, height: 64, overflow: 'hidden' }}
  >
    <div
      onClick={onRemove}
      style={{
        position: 'absolute',
        top: -8,
        right: 1,
        // background: 'rgba(255,255,255,0.8)',
        borderRadius: '50%',
        cursor: 'pointer',
        padding: 1,
        zIndex: 2
      }}
    >
      <X size={20} color="red" />
    </div>
    <img
      src={image.url}
      alt="attachment"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </div>
)}

    </div>
  )
} 