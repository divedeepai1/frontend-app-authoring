

import { useState } from "react"
import { ImageIcon, Trash2, Plus, X } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"

export function FillInTheBlankQuestion({ question, onQuestionChange, onDelete }) {
  const [questionText, setQuestionText] = useState(question.natural_text || "")
  const [blanks, setBlanks] = useState(question.blanks || [{ answer: "", position: 0 }])
  const questionError = !questionText || !questionText.trim() ? 'Question is required.' : null
  const blanksError = blanks.length === 0 ? 'Add at least one blank.' : null
  const emptyBlankError = blanks.some((b) => !b.answer || !b.answer.trim()) ? 'Blank answers cannot be empty.' : null

  const handleTextChange = (text) => {
    setQuestionText(text)
    onQuestionChange({ ...question, natural_text:text })
  }

  const handleQuestionImageSelect = (file) => {
    const url = URL.createObjectURL(file)
    onQuestionChange({ ...question, image_url: url, image_name: file.name })
  }
  const handleQuestionImageRemove = () => {
    onQuestionChange({ ...question, image_url: "", image_name: "" })
  }

  const handleBlankChange = (index, value) => {
    const newBlanks = [...blanks]
    newBlanks[index].answer = value
    setBlanks(newBlanks)
    onQuestionChange({ ...question, blanks: newBlanks })
  }

  const addBlank = () => {
    const newBlanks = [...blanks, { answer: "", position: blanks.length, image_url: "", image_name: "" }]
    setBlanks(newBlanks)
    onQuestionChange({ ...question, blanks: newBlanks })
  }

  const removeBlank = (index) => {
    if (blanks.length > 1) {
      const newBlanks = blanks.filter((_, i) => i !== index)
      setBlanks(newBlanks)
      onQuestionChange({ ...question, blanks: newBlanks })
    }
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Fill in the Blank Question</h4>
        <div
          onClick={onDelete}
          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="question-text" className="block text-sm font-medium text-gray-700 mb-1">
            Question (Use _____ for blanks)
          </label>
          <textarea
            id="question-text"
            placeholder="Enter your question with _____ where students should fill in answers..."
            value={questionText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {questionError && (
            <div className="mt-1 text-xs text-red-600">{questionError}</div>
          )}
          <div className="mt-2 flex justify-end">
            <ImageAttach
              image={question.image_url ? { url: question.image_url } : null}
              onSelect={(file) => handleQuestionImageSelect(file)}
              onRemove={() => handleQuestionImageRemove()}
              label="Attach question image"
              scope={{ questionId: question.id, kind: 'question' }}
              showPreview={false}
            />
          </div>
          {blanksError && (
            <div className="mt-1 text-xs text-red-600">{blanksError}</div>
          )}
          {emptyBlankError && (
            <div className="mt-1 text-xs text-red-600">{emptyBlankError}</div>
          )}
          {question.image_url && (
            <div className="mt-3 relative inline-block">
              <img src={question.image_url} alt="question" style={{ maxHeight: 140 }} className="w-auto rounded border" />
              <button
                type="button"
                onClick={handleQuestionImageRemove}
                className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow"
                aria-label="Remove image"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answers for Blanks</label>
          <div className="space-y-2">
            {blanks.map((blank, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-16">Blank {index + 1}:</span>
                <input
                  type="text"
                  placeholder="Correct answer"
                  value={blank.answer}
                  onChange={(e) => handleBlankChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {/* <ImageAttach
                  image={blank.image_url ? { url: blank.image_url } : null}
                  onSelect={(file) => {
                    const url = URL.createObjectURL(file)
                    const newBlanks = blanks.map((b, i) => i === index ? { ...b, image_url: url, image: file.name } : b)
                    setBlanks(newBlanks)
                    onQuestionChange({ ...question, blanks: newBlanks })
                  }}
                  onRemove={() => {
                    const newBlanks = blanks.map((b, i) => i === index ? { ...b, image_url: "", image: "" } : b)
                    setBlanks(newBlanks)
                    onQuestionChange({ ...question, blanks: newBlanks })
                  }}
                  label="Attach blank image"
                  scope={{ questionId: question.id, kind: 'blank', refId: String(index) }}
                /> */}
                {blanks.length > 1 && (
                  <div
                    onClick={() => removeBlank(index)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            onClick={addBlank}
            className="mt-2 flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Blank
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
