

import { useState } from "react"
import { ImageIcon, Trash2, Plus, X, Eye } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"
import { EnhancedRichTextEditor } from "../enhanced-rich-text-editor"
import { useQuestionImages } from "./useQuestionImages"

export function FillInTheBlankQuestion({ question, onQuestionChange, onDelete, onTimestampClick }) {
  const [questionContent, setQuestionContent] = useState({ html: question.natural_text || "" })
  const [blanks, setBlanks] = useState(question.blanks || [{ answer: "", position: 0 }])
  const { questionImages, handleQuestionImageSelect, handleQuestionImageRemoveAt } = useQuestionImages(question)
  const plainQuestionText = (questionContent?.html || "").replace(/<[^>]+>/g, "").trim()
  const questionError = !plainQuestionText ? 'Question is required.' : null
  const blanksError = blanks.length === 0 ? 'Add at least one blank.' : null
  const emptyBlankError = blanks.some((b) => !b.answer || !b.answer.trim()) ? 'Blank answers cannot be empty.' : null

  const handleContentChange = (newContent) => {
    setQuestionContent(newContent)
    const text = newContent?.html || ""
    onQuestionChange({ ...question, natural_text: text })
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
            Question (Use _____ for blanks)
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
          {question.video_timestamp && onTimestampClick && (
            <div className="mt-2 flex flex-wrap gap-3">
              <div
                className="relative flex items-center justify-between w-44 px-3 py-2 rounded-lg bg-white border border-purple-200 text-purple-700 text-sm cursor-pointer shadow-sm hover:shadow"
                onClick={() => onTimestampClick(question.video_timestamp)}
              >
                <div className="flex items-center gap-2 pr-6">
                  <Eye className="w-4 h-4" />
                  <span className="truncate">Timestamp Video</span>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuestionChange({ ...question, video_timestamp: null });
                  }}
                  className="absolute top-1 right-1 p-0.5 rounded-full text-red-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}
          {blanksError && (
            <div className="mt-1 text-xs text-red-600">{blanksError}</div>
          )}
          {emptyBlankError && (
            <div className="mt-1 text-xs text-red-600">{emptyBlankError}</div>
          )}
          {/* No inline preview; preview shown in dialog via ImageAttach */}
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
