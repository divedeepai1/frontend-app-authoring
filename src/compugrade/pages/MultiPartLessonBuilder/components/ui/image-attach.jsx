import { useRef, useState } from 'react'
import { X, Image as ImageIcon, Eye, Download } from 'lucide-react'
import { useImages } from './images-context'

// scope: { questionId: string, kind: 'question'|'option'|'answer'|'item'|'blank'|'pair-term'|'pair-definition'|'category', refId?: string, role?: string }
export function ImageAttach({ image, onSelect, onRemove, label = 'Attach image', scope, showPreview = true, fileName }) {
  const inputRef = useRef(null)
  const { addImage, addImageWithScope } = useImages()
  const [isOpen, setIsOpen] = useState(false)

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

  const openPreview = () => setIsOpen(true)

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex items-center gap-2">
        <div
          onClick={handleClick}
          className="inline-flex items-center gap-2 px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
          title={label}
        >
          <ImageIcon size={16} />
        </div>
        {image?.url && (
          <div className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <button type="button" className="flex  bg-transparent border-none items-center gap-1" onClick={openPreview} title="Preview image">
              <Eye size={14} />
              <span className="truncate max-w-[160px]">{fileName || 'image'}</span>
            </button>
            <button type="button" onClick={onRemove} className="ml-1 bg-transparent border-none text-red-600 hover:text-red-700" title="Remove image">
              <X size={14} />
            </button>
          </div>
        )}
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

      {isOpen && image?.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-800 truncate mr-4">{fileName || 'Image preview'}</div>

              <div>

               {image.url && (
                                <a
                                  href={image.url}
                                  download={fileName || 'image'}
                                  className="p-1 rounded "
                                >
                                  <Download className="w-5 h-5 text-gray-500 " />
                                </a>
                              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 border-none bg-transparent hover:text-gray-700 hover:bg-gray-100 rounded"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto border rounded">
              <img src={image.url} alt="preview" className="w-full h-auto block" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


