

import { useState } from "react"
import { Trash2, Plus, X } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"

export function CategorizingQuestion({ question, onQuestionChange, onDelete }) {
  const [questionText, setQuestionText] = useState(question.text || "")
  const [categories, setCategories] = useState(question.categories || ["Category 1", "Category 2"])
  const [items, setItems] = useState(question.items || [{ text: "", category: 0 }])
  const questionError = !questionText || !questionText.trim() ? 'Question is required.' : null
  const categoriesError = categories.length < 1 ? 'Add at least one category.' : null
  const emptyCategoryError = categories.some((c) => !c || !c.toString().trim()) ? 'Category names cannot be empty.' : null
  const itemsError = items.length < 1 ? 'Add at least one item.' : null
  const emptyItemError = items.some((it) => !it.text || !it.text.toString().trim()) ? 'Item text cannot be empty.' : null

  const handleTextChange = (text) => {
    setQuestionText(text)
    onQuestionChange({ ...question, text })
  }

  const handleCategoryChange = (index, value) => {
    const newCategories = [...categories]
    newCategories[index] = value
    setCategories(newCategories)
    onQuestionChange({ ...question, categories: newCategories })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
    onQuestionChange({ ...question, items: newItems })
  }

  const addCategory = () => {
    const newCategories = [...categories, `Category ${categories.length + 1}`]
    setCategories(newCategories)
    onQuestionChange({ ...question, categories: newCategories })
  }

  const removeCategory = (index) => {
    if (categories.length > 2) {
      const newCategories = categories.filter((_, i) => i !== index)
      setCategories(newCategories)

      // Update items that reference removed category
      const newItems = items.map((item) => ({
        ...item,
        category: item.category > index ? item.category - 1 : item.category >= index ? 0 : item.category,
      }))
      setItems(newItems)

      onQuestionChange({ ...question, categories: newCategories, items: newItems })
    }
  }

  const addItem = () => {
    const newItems = [...items, { text: "", category: 0 }]
    setItems(newItems)
    onQuestionChange({ ...question, items: newItems })
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index)
      setItems(newItems)
      onQuestionChange({ ...question, items: newItems })
    }
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Categorizing Question</h4>
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
          <input
            id="question-text"
            type="text"
            placeholder="Enter instructions for categorizing..."
            value={questionText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          {categoriesError && (
            <div className="mt-1 text-xs text-red-600">{categoriesError}</div>
          )}
          {emptyCategoryError && (
            <div className="mt-1 text-xs text-red-600">{emptyCategoryError}</div>
          )}
          {/* No inline preview; preview shown in dialog via ImageAttach */}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Category ${index + 1}`}
                  value={category}
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {categories.length > 2 && (
                  <div
                    onClick={() => removeCategory(index)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
          {itemsError && (
            <div className="mt-1 text-xs text-red-600">{itemsError}</div>
          )}
          {emptyItemError && (
            <div className="mt-1 text-xs text-red-600">{emptyItemError}</div>
          )}

          <div
            onClick={addCategory}
            className="mt-2 flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Items to Categorize</label>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Item text"
                  value={item.text}
                  onChange={(e) => handleItemChange(index, "text", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={item.category}
                  onChange={(e) => handleItemChange(index, "category", Number.parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category, catIndex) => (
                    <option key={catIndex} value={catIndex}>
                      {category}
                    </option>
                  ))}
                </select>
                <ImageAttach
                  image={item.image_url ? { url: item.image_url } : null}
                  onSelect={(file) => {
                    const url = URL.createObjectURL(file)
                    const newItems = items.map((it, i) => i === index ? { ...it, image_url: url, image_name: file.name } : it)
                    setItems(newItems)
                    onQuestionChange({ ...question, items: newItems })
                  }}
                  onRemove={() => {
                    const newItems = items.map((it, i) => i === index ? { ...it, image_url: "", image_name: "" } : it)
                    setItems(newItems)
                    onQuestionChange({ ...question, items: newItems })
                  }}
                  label="Attach item image"
                  scope={{ questionId: question.id, kind: 'item', refId: String(index) }}
                />
                {items.length > 1 && (
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
      </div>
    
  )
}
