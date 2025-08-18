import { useRef } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import { useImages } from './images-context'

// scope: { questionId: string, kind: 'question'|'option'|'answer'|'item'|'blank'|'pair-term'|'pair-definition'|'category', refId?: string, role?: string }
export function ImageAttach({ image, onSelect, onRemove, label = 'Attach image', scope, showPreview = true }) {
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
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <div
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
        title={label}
      >
        <ImageIcon size={16} />
      </div>
      {showPreview && image?.url && (
        <div className="relative border rounded" style={{ width: 48, height: 48, overflow: 'hidden' }}>
          <div
            onClick={onRemove}
            className="absolute -top-2 right-0 rounded-full cursor-pointer p-0.5 z-20"
          >
            <X size={16} color="red" />
          </div>
          <img src={image.url} alt="attachment" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  )
}


