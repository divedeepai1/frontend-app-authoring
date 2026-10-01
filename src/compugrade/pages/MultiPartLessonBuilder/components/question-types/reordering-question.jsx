

import { useState } from "react"
import { Trash2, Plus, X, GripVertical } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"
import { EnhancedRichTextEditor } from "../enhanced-rich-text-editor"
import { useQuestionImages } from "./useQuestionImages"

export function ReorderingQuestion({ question, onQuestionChange, onDelete }) {
  const [questionContent, setQuestionContent] = useState({ html: question.text || "" })
  const [items, setItems] = useState(question.items || ["Item 1", "Item 2", "Item 3"])
  const [draggedIndex, setDraggedIndex] = useState(null)
  const { questionImages, handleQuestionImageSelect, handleQuestionImageRemoveAt } = useQuestionImages(question)
  const plainQuestionText = (questionContent?.html || "").replace(/<[^>]+>/g, "").trim()
  const questionError = !plainQuestionText ? 'Question is required.' : null
  const itemsError = items.length < 2 ? 'Add at least two items.' : null
  const emptyItemError = items.some((it) => !it || !it.toString().trim()) ? 'Items cannot be empty.' : null

  const handleContentChange = (newContent) => {
    setQuestionContent(newContent)
    const text = newContent?.html || ""
    onQuestionChange({ ...question, text })
  }

  const handleItemChange = (index, value) => {
    const newItems = [...items]
    newItems[index] = value
    setItems(newItems)
    onQuestionChange({ ...question, items: newItems })
  }

  const addItem = () => {
    const newItems = [...items, `Item ${items.length + 1}`]
    setItems(newItems)
    onQuestionChange({ ...question, items: newItems })
  }

  const removeItem = (index) => {
    if (items.length > 2) {
      const newItems = items.filter((_, i) => i !== index)
      setItems(newItems)
      onQuestionChange({ ...question, items: newItems })
    }
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newItems = [...items]
      const draggedItem = newItems[draggedIndex]

      // Remove dragged item
      newItems.splice(draggedIndex, 1)

      // Insert at new position
      const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
      newItems.splice(insertIndex, 0, draggedItem)

      setItems(newItems)
      onQuestionChange({ ...question, items: newItems })
    }
    setDraggedIndex(null)
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Reordering Question</h4>
        {/* <div
          onClick={onDelete}
          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </div> */}
      </div>

      <div className="space-y-4">
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
          <div className="mt-2">
            <ImageAttach
              images={questionImages}
              onSelect={(file, record) => handleQuestionImageSelect(file, record, onQuestionChange)}
              onRemoveAt={(index) => handleQuestionImageRemoveAt(index, onQuestionChange)}
              label="Attach question images"
              scope={{ questionId: question.id, kind: 'question' }}
              showPreview={false}
              multiple={true}
            />
          </div>
          {itemsError && (
            <div className="mt-1 text-xs text-red-600">{itemsError}</div>
          )}
          {emptyItemError && (
            <div className="mt-1 text-xs text-red-600">{emptyItemError}</div>
          )}
          {/* No inline preview; preview shown in dialog via ImageAttach */}
        </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Items to Reorder (Correct Order)</label>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="flex items-center gap-2 p-2 border border-gray-200 rounded-md cursor-grab active:cursor-grabbing hover:bg-gray-50"
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 w-8">{index + 1}.</span>
                <input
                  type="text"
                  placeholder={`Item ${index + 1}`}
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {items.length > 2 && (
                  <div
                    onClick={() => removeItem(index)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            onClick={addItem}
            className="mt-2 flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </div>
        </div>

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
