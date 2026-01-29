

import { useState } from "react"
import { Trash2, Plus, X, GripVertical } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"
import { EnhancedRichTextEditor } from "../enhanced-rich-text-editor"

export function DragDropQuestion({ question, onQuestionChange, onDelete }) {
  const [questionContent, setQuestionContent] = useState({ html: question.text || "" })
  const [draggableItems, setDraggableItems] = useState(question.draggableItems || ["", ""])
  const [dropZones, setDropZones] = useState(question.dropZones || ["", ""])
  const [correctMatches, setCorrectMatches] = useState(question.correctMatches || {})
  const [draggedItem, setDraggedItem] = useState(null)
  const plainQuestionText = (questionContent?.html || "").replace(/<[^>]+>/g, "").trim()
  const questionError = !plainQuestionText ? 'Question is required.' : null
  const itemsError = draggableItems.length < 1 ? 'Add at least one draggable item.' : null
  const emptyItemsError = draggableItems.some((i) => !i || !i.toString().trim()) ? 'Draggable item text cannot be empty.' : null
  const zonesError = dropZones.length < 1 ? 'Add at least one drop zone.' : null
  const emptyZonesError = dropZones.some((z) => !z || !z.toString().trim()) ? 'Drop zone text cannot be empty.' : null

  const handleContentChange = (newContent) => {
    setQuestionContent(newContent)
    const text = newContent?.html || ""
    onQuestionChange({ ...question, text })
  }

  const handleDraggableItemChange = (index, value) => {
    const newItems = [...draggableItems]
    newItems[index] = value
    setDraggableItems(newItems)
    onQuestionChange({ ...question, draggableItems: newItems })
  }

  const handleDropZoneChange = (index, value) => {
    const newZones = [...dropZones]
    newZones[index] = value
    setDropZones(newZones)
    onQuestionChange({ ...question, dropZones: newZones })
  }

  const addDraggableItem = () => {
    const newItems = [...draggableItems, ""]
    setDraggableItems(newItems)
    onQuestionChange({ ...question, draggableItems: newItems })
  }

  const removeDraggableItem = (index) => {
    if (draggableItems.length > 1) {
      const newItems = draggableItems.filter((_, i) => i !== index)
      setDraggableItems(newItems)

      // Update correct matches
      const newMatches = { ...correctMatches }
      delete newMatches[index]
      // Adjust indices for remaining items
      const adjustedMatches = {}
      Object.keys(newMatches).forEach((key) => {
        const numKey = Number.parseInt(key)
        const newKey = numKey > index ? numKey - 1 : numKey
        adjustedMatches[newKey] = newMatches[key]
      })
      setCorrectMatches(adjustedMatches)

      onQuestionChange({ ...question, draggableItems: newItems, correctMatches: adjustedMatches })
    }
  }

  const addDropZone = () => {
    const newZones = [...dropZones, ""]
    setDropZones(newZones)
    onQuestionChange({ ...question, dropZones: newZones })
  }

  const removeDropZone = (index) => {
    if (dropZones.length > 1) {
      const newZones = dropZones.filter((_, i) => i !== index)
      setDropZones(newZones)

      // Update correct matches
      const newMatches = { ...correctMatches }
      Object.keys(newMatches).forEach((key) => {
        if (newMatches[key] === index) {
          delete newMatches[key]
        } else if (newMatches[key] > index) {
          newMatches[key] = newMatches[key] - 1
        }
      })
      setCorrectMatches(newMatches)

      onQuestionChange({ ...question, dropZones: newZones, correctMatches: newMatches })
    }
  }

  const handleDragStart = (e, itemIndex) => {
    setDraggedItem(itemIndex)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e, zoneIndex) => {
    e.preventDefault()
    if (draggedItem !== null) {
      const newMatches = { ...correctMatches, [draggedItem]: zoneIndex }
      setCorrectMatches(newMatches)
      onQuestionChange({ ...question, correctMatches: newMatches })
      setDraggedItem(null)
    }
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Drag and Drop Question</h4>
        {/* <div
          onClick={onDelete}
          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </div> */}
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="question-text" className="block text-sm font-medium text-gray-700 mb-1">
            Question
          </label>
          <EnhancedRichTextEditor
            id={`question-editor-${question.id}`}
            content={questionContent}
            onContentChange={handleContentChange}
            lines={2}
          />
          {questionError && (
            <div className="mt-1 text-xs text-red-600">{questionError}</div>
          )}
          <div className="mt-2 flex justify-end">
            <ImageAttach
              image={question.image_url ? { url: question.image_url } : null}
              onSelect={(file) => {
                const url = URL.createObjectURL(file)
                onQuestionChange({ ...question, image_url: url, image_name: file.name })
              }}
              onRemove={() => onQuestionChange({ ...question, image_url: "", image_name: "" })}
              label="Attach question image"
              scope={{ questionId: question.id, kind: 'question' }}
              showPreview={false}
              fileName={question.image_name}
            />
          </div>
          {/* No inline preview; preview shown in dialog via ImageAttach */}

        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Draggable Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Draggable Items</label>
            <div className="space-y-2">
              {draggableItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    className="flex items-center gap-2 p-2 bg-blue-100 border border-blue-200 rounded cursor-grab active:cursor-grabbing min-w-0"
                  >
                    <GripVertical className="w-4 h-4 text-blue-600" />
                    <input
                      type="text"
                      placeholder={`Item ${index + 1}`}
                      value={item}
                      onChange={(e) => handleDraggableItemChange(index, e.target.value)}
                      className="border-0 bg-transparent p-0 h-auto focus:outline-none flex-1"
                    />
                  </div>
                  {draggableItems.length > 1 && (
                    <div
                      onClick={() => removeDraggableItem(index)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {zonesError && (
              <div className="mt-1 text-xs text-red-600">{zonesError}</div>
            )}
            {emptyZonesError && (
              <div className="mt-1 text-xs text-red-600">{emptyZonesError}</div>
            )}

            <div
              onClick={addDraggableItem}
              className="mt-2 flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </div>
          </div>

          {/* Drop Zones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Drop Zones</label>
            <div className="space-y-2">
              {dropZones.map((zone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="flex-1 p-3 border-2 border-dashed border-gray-300 rounded bg-gray-50 min-h-[60px] flex items-center"
                  >
                    <input
                      type="text"
                      placeholder={`Drop zone ${index + 1}`}
                      value={zone}
                      onChange={(e) => handleDropZoneChange(index, e.target.value)}
                      className="border-0 bg-transparent p-0 h-auto focus:outline-none flex-1"
                    />
                    {correctMatches && Object.values(correctMatches).includes(index) && (
                      <div className="ml-2 text-xs text-green-600 font-medium">✓ Matched</div>
                    )}
                  </div>
                  {dropZones.length > 1 && (
                    <div
                      onClick={() => removeDropZone(index)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div
              onClick={addDropZone}
              className="mt-2 flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Zone
            </div>
          </div>
        </div>

        {/* Correct Matches Display */}
        {Object.keys(correctMatches).length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <label className="text-sm font-medium text-green-800">Correct Matches:</label>
            <div className="mt-1 text-sm text-green-700">
              {Object.entries(correctMatches).map(([itemIndex, zoneIndex]) => (
                <div key={itemIndex}>
                  "{draggableItems[Number.parseInt(itemIndex)] || `Item ${Number.parseInt(itemIndex) + 1}`}" → "
                  {dropZones[zoneIndex] || `Zone ${zoneIndex + 1}`}"
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hint (Optional)</label>
          <textarea
            placeholder="Provide hint..."
            value={question.explanation || ""}
            onChange={(e) => onQuestionChange({ ...question, explanation: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    
  )
}
