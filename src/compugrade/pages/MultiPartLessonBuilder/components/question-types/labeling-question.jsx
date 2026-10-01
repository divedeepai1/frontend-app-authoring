

import { useState } from "react"
import { Trash2, Plus, X } from "lucide-react"
import { ImageAttach } from "../ui/image-attach"
import { EnhancedRichTextEditor } from "../enhanced-rich-text-editor"
import { useQuestionImages } from "./useQuestionImages"

export function LabelingQuestion({ question, onQuestionChange, onDelete }) {
  const [questionContent, setQuestionContent] = useState({ html: question.text || "" })
  const [labels, setLabels] = useState(question.labels || [{ text: "", x: 50, y: 50 }])
  const [imageUrl, setImageUrl] = useState(question.imageUrl || "")
  const { questionImages, handleQuestionImageSelect, handleQuestionImageRemoveAt } = useQuestionImages(question)
  const plainQuestionText = (questionContent?.html || "").replace(/<[^>]+>/g, "").trim()
  const questionError = !plainQuestionText ? 'Question is required.' : null
  const labelsError = labels.length < 1 ? 'Add at least one label.' : null
  const emptyLabelError = labels.some((l) => !l.text || !l.text.toString().trim()) ? 'Label text cannot be empty.' : null

  const handleContentChange = (newContent) => {
    setQuestionContent(newContent)
    const text = newContent?.html || ""
    onQuestionChange({ ...question, text })
  }

  const handleLabelChange = (index, field, value) => {
    const newLabels = [...labels]
    newLabels[index][field] = value
    setLabels(newLabels)
    onQuestionChange({ ...question, labels: newLabels })
  }

  const addLabel = () => {
    const newLabels = [...labels, { text: "", x: 50, y: 50 }]
    setLabels(newLabels)
    onQuestionChange({ ...question, labels: newLabels })
  }

  const removeLabel = (index) => {
    if (labels.length > 1) {
      const newLabels = labels.filter((_, i) => i !== index)
      setLabels(newLabels)
      onQuestionChange({ ...question, labels: newLabels })
    }
  }

  const handleImageUrlChange = (url) => {
    setImageUrl(url)
    onQuestionChange({ ...question, imageUrl: url })
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Labeling Question</h4>
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
          {/* No inline preview; preview shown in dialog via ImageAttach */}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="image-url" className="block text-sm font-medium text-gray-700 mb-1">
              Base Image
            </label>
            <ImageAttach
              image={imageUrl ? { url: imageUrl } : null}
              onSelect={(file) => {
                const url = URL.createObjectURL(file)
                handleImageUrlChange(url)
              }}
              onRemove={() => handleImageUrlChange("")}
              label="Attach base image"
              scope={{ questionId: question.id, kind: 'question' }}
            />
          </div>
          {labelsError && (
            <div className="mt-1 text-xs text-red-600">{labelsError}</div>
          )}
          {emptyLabelError && (
            <div className="mt-1 text-xs text-red-600">{emptyLabelError}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Labels</label>
          <div className="space-y-2">
            {labels.map((label, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Label text"
                  value={label.text}
                  onChange={(e) => handleLabelChange(index, "text", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="X"
                  value={label.x}
                  onChange={(e) => handleLabelChange(index, "x", Number.parseInt(e.target.value))}
                  className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Y"
                  value={label.y}
                  onChange={(e) => handleLabelChange(index, "y", Number.parseInt(e.target.value))}
                  className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {labels.length > 1 && (
                  <div
                    onClick={() => removeLabel(index)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            onClick={addLabel}
            className="mt-2 flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Label
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
