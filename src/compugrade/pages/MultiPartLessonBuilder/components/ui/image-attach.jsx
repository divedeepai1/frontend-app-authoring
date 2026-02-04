import { useRef, useState } from 'react'
import { X, Image as ImageIcon, Eye, Download } from 'lucide-react'
import { useImages } from './images-context'

// scope: { questionId: string, kind: 'question'|'option'|'answer'|'item'|'blank'|'pair-term'|'pair-definition'|'category', refId?: string, role?: string }
export function ImageAttach({ image, images, onSelect, onRemove, onRemoveAt, label = 'Attach image', scope, showPreview = true, fileName, multiple = false }) {
  const inputRef = useRef(null)
  const { addImage, addImageWithScope } = useImages()
  const [isOpen, setIsOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      if (multiple) {
        // Handle multiple files
        const fileArray = Array.from(files)
        fileArray.forEach((file) => {
          let record
          if (scope && scope.questionId && scope.kind) {
            record = addImageWithScope({ ...scope, file })
          } else {
            record = addImage(file)
          }
          if (onSelect) {
            onSelect(file, record)
          }
        })
      } else {
        // Handle single file
        const file = files[0]
        let record
        if (scope && scope.questionId && scope.kind) {
          record = addImageWithScope({ ...scope, file })
        } else {
          record = addImage(file)
        }
        if (onSelect) {
          onSelect(file, record)
        }
      }
      e.target.value = ''
    }
  }

  const openPreview = (img) => {
    setPreviewImage(img)
    setIsOpen(true)
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      
      {!multiple && (
        <div className="flex items-center gap-2 justify-end">
          {image?.url && (
            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <button type="button" className="flex  bg-transparent border-none items-center gap-1" onClick={() => openPreview(image)} title="Preview image">
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
          <div
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
            title={label}
          >
            <ImageIcon size={16} />
          </div>
        </div>
      )}

      {/* Multiple images: upload button on extreme left, badges row below */}
      {multiple && (
        <>
          {/* Upload button - extreme left */}
          <div className="flex justify-start">
            <div
              onClick={handleClick}
              className="inline-flex items-center gap-2 px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
              title={label}
            >
              <ImageIcon size={16} />
            </div>
          </div>
          {/* Scrollable image badges row - below upload button, starts from left */}
          {Array.isArray(images) && images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto w-full" style={{ scrollbarWidth: 'thin' }}>
              {images.map((img, index) => (
                <div key={index} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                  <button type="button" className="flex bg-transparent border-none items-center gap-1" onClick={() => openPreview({ url: img.url || img, name: img.name || img.fileName || `Image ${index + 1}` })} title="Preview image">
                    <Eye size={14} />
                    <span className="truncate max-w-[160px] whitespace-nowrap">{img.name || img.fileName || `Image ${index + 1}`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (onRemoveAt) {
                        onRemoveAt(index)
                      } else if (onRemove) {
                        onRemove()
                      }
                    }}
                    className="ml-1 bg-transparent border-none text-red-600 hover:text-red-700 cursor-pointer"
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {isOpen && previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-800 truncate mr-4">{previewImage.name || 'Image preview'}</div>
              <div>
                {previewImage.url && (
                  <a
                    href={previewImage.url}
                    download={previewImage.name || 'image'}
                    className="p-1 rounded"
                  >
                    <Download className="w-5 h-5 text-gray-500" />
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
              <img src={previewImage.url} alt="preview" className="w-full h-auto block" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


